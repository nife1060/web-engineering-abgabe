/**
 * Hier kommen die Webhook-Events von Stripe an. Das ist die einzige Stelle,
 * an der wirklich Zugriff auf einen Kurs freigeschaltet wird.
 * `createCheckoutSession` (`@/lib/checkout.ts`) startet nur die
 * Stripe-Session und legt eine PENDING-Bestellung an — die Einschreibung
 * selbst passiert erst hier, sobald Stripe uns sagt dass bezahlt wurde.
 *
 * Stripe schickt uns kein "wer hat das gemacht" mit, daher müssen wir uns
 * über die `userId`/`courseId`-Metadaten behelfen, die wir beim Erstellen
 * der Checkout-Session selbst mitgegeben haben (siehe `@/lib/checkout.ts`).
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Prüft, ob ein eingehendes Stripe-Event echt ist, und gibt es an den passenden Handler weiter. */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  const rawBody = await request.text();

  // Erst prüfen ob die Anfrage wirklich von Stripe kommt (Signatur mit dem
  // Webhook-Secret), bevor wir dem Inhalt trauen. Sonst könnte sich
  // theoretisch jeder selbst einen Kurs freischalten, indem er hier eine
  // gefälschte Anfrage schickt.
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionUpdated(event.data.object);
        break;
      default:
        // Event interessiert uns nicht — Stripe schickt noch viele andere, ist okay so
        break;
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err);
    // Trotzdem 200 zurückgeben, sonst schickt Stripe das Event endlos
    // wieder. Der Fehler ist ja schon geloggt.
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

/**
 * Schaltet den Kurs frei, wenn der Checkout abgeschlossen ist (egal ob
 * Einmalzahlung oder erste Abo-Rate), und speichert die Bestellung samt
 * Beleg-Link. Stripe kann uns dasselbe Event auch mal doppelt schicken,
 * deshalb checken wir vorher ob die Bestellung schon als PAID markiert ist.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  const mode = session.metadata?.mode ?? session.mode;

  if (!userId || !courseId) {
    console.error("checkout.session.completed missing userId/courseId metadata", session.id);
    return;
  }

  const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (order && order.status === "PAID") {
    return;
  }

  let receiptUrl: string | null = null;
  let hostedInvoiceUrl: string | null = null;
  let stripeInvoiceId: string | null = null;
  let stripePaymentIntentId: string | null = null;

  // Die Beleg-/Rechnungs-URL ist nur nice-to-have für die
  // Bestellübersicht, kein Muss. Wenn das hier schiefgeht, loggen wir es
  // nur und machen trotzdem mit der Einschreibung weiter.
  if (mode === "payment" && session.payment_intent) {
    const intentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent.id;
    stripePaymentIntentId = intentId;

    try {
      const intent = await stripe.paymentIntents.retrieve(intentId, {
        expand: ["latest_charge"],
      });
      const charge = intent.latest_charge && typeof intent.latest_charge !== "string"
        ? intent.latest_charge
        : null;
      if (charge) {
        receiptUrl = charge.receipt_url ?? null;
      }
    } catch (err) {
      console.error("Failed to expand payment_intent for receipt URL:", err);
    }
  }

  if (session.invoice) {
    const invoiceId = typeof session.invoice === "string" ? session.invoice : session.invoice.id ?? null;
    stripeInvoiceId = invoiceId;
    if (invoiceId) {
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        hostedInvoiceUrl = invoice.hosted_invoice_url ?? null;
      } catch (err) {
        console.error("Failed to retrieve invoice:", err);
      }
    }
  }

  await prisma.order.upsert({
    where: { stripeSessionId: session.id },
    create: {
      userId,
      courseId,
      amount: (session.amount_total ?? 0) / 100,
      currency: session.currency ?? "eur",
      status: "PAID",
      stripeSessionId: session.id,
      stripePaymentIntentId,
      stripeInvoiceId,
      hostedInvoiceUrl,
      receiptUrl,
      paidAt: new Date(),
    },
    update: {
      status: "PAID",
      paidAt: new Date(),
      stripePaymentIntentId,
      stripeInvoiceId,
      hostedInvoiceUrl,
      receiptUrl,
    },
  });

  if (mode === "subscription" && session.subscription) {
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const item = subscription.items.data[0];
    // current_period_end fehlt eigentlich nie, der 30-Tage-Fallback ist
    // nur fürs Allerwenigste falls Stripe doch mal kein Datum mitschickt.
    const currentPeriodEnd = item?.current_period_end
      ? new Date(item.current_period_end * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const customerId = typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscriptionId },
      create: {
        userId,
        courseId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        status: subscription.status,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        status: subscription.status,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: {
        userId,
        courseId,
        source: "SUBSCRIPTION",
        active: true,
        expiresAt: currentPeriodEnd,
      },
      update: {
        source: "SUBSCRIPTION",
        active: true,
        expiresAt: currentPeriodEnd,
      },
    });
  } else {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: {
        userId,
        courseId,
        source: "PURCHASE",
        active: true,
      },
      update: {
        source: "PURCHASE",
        active: true,
        expiresAt: null,
      },
    });
  }
}

/** Setzt eine Bestellung auf FAILED, wenn die Checkout-Session ohne Zahlung abgelaufen ist. */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (!order || order.status === "PAID") return;
  await prisma.order.update({
    where: { stripeSessionId: session.id },
    data: { status: "FAILED" },
  });
}

/**
 * Verlängert den Zugriff, wenn eine wiederkehrende Abo-Zahlung
 * durchgegangen ist. Die allererste Zahlung läuft nicht über diese
 * Funktion, sondern über `handleCheckoutCompleted`.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const parent = invoice.parent;
  const subscriptionId = parent && parent.type === "subscription_details"
    ? (typeof parent.subscription_details?.subscription === "string"
        ? parent.subscription_details.subscription
        : parent.subscription_details?.subscription?.id ?? null)
    : null;

  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!subscription) return;

  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
  const item = stripeSub.items.data[0];
  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : subscription.currentPeriodEnd;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: stripeSub.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });

  await prisma.enrollment.updateMany({
    where: { userId: subscription.userId, courseId: subscription.courseId },
    data: { active: true, expiresAt: currentPeriodEnd },
  });
}

/**
 * Wird bei Änderungen am Abo aufgerufen (Plan-Wechsel, Kündigung) und
 * schaltet den Kurs ab, sobald das Abo nicht mehr aktiv ist. Behandelt
 * sowohl "updated" als auch "deleted", weil beide Events gleich aussehen.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const record = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!record) return;

  const item = subscription.items.data[0];
  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : record.currentPeriodEnd;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  const stillActive = subscription.status === "active" || subscription.status === "trialing";
  await prisma.enrollment.updateMany({
    where: { userId: record.userId, courseId: record.courseId },
    data: {
      active: stillActive,
      expiresAt: currentPeriodEnd,
    },
  });
}

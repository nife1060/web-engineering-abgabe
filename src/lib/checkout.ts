import { prisma } from "@/lib/prisma";
import { stripe, getBaseUrl } from "@/lib/stripe";

export type CreateCheckoutResult =
  | { kind: "free"; redirectTo: string }
  | { kind: "already-enrolled"; redirectTo: string }
  | { kind: "stripe"; redirectTo: string }
  | { kind: "error"; message: string };

export async function createCheckoutSession(
  userId: string,
  courseId: string,
): Promise<CreateCheckoutResult> {
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
  ]);

  if (!user) return { kind: "error", message: "User not found" };
  if (!course) return { kind: "error", message: "Course not found" };

  if (course.status !== "PUBLISHED") {
    return { kind: "error", message: "Course is not available" };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing && existing.active && (!existing.expiresAt || existing.expiresAt > new Date())) {
    return { kind: "already-enrolled", redirectTo: `/learn/${courseId}` };
  }

  if (course.pricingModel === "FREE") {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, source: "FREE", active: true },
      update: { active: true, source: "FREE", expiresAt: null },
    });
    return { kind: "free", redirectTo: `/learn/${courseId}` };
  }

  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    });
  }

  const baseUrl = getBaseUrl();
  const isSubscription = course.pricingModel === "SUBSCRIPTION";
  const amount = isSubscription ? course.subscriptionPrice : course.price;

  if (amount <= 0) {
    return { kind: "error", message: "Course price is invalid" };
  }

  const unitAmountCents = Math.round(amount * 100);

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer: stripeCustomerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: unitAmountCents,
          product_data: {
            name: course.title,
            description: course.description.slice(0, 500),
            metadata: { courseId: course.id },
          },
          ...(isSubscription
            ? { recurring: { interval: "month" as const } }
            : { tax_behavior: "inclusive" as const }),
        },
      },
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/courses/${courseId}?canceled=true`,
    metadata: {
      userId: user.id,
      courseId: course.id,
      mode: isSubscription ? "subscription" : "payment",
    },
    ...(isSubscription
      ? {
          subscription_data: {
            metadata: { userId: user.id, courseId: course.id },
          },
        }
      : {
          payment_intent_data: {
            metadata: { userId: user.id, courseId: course.id },
          },
        }),
  });

  if (!session.url) {
    return { kind: "error", message: "Stripe did not return a checkout URL" };
  }

  await prisma.order.create({
    data: {
      userId: user.id,
      courseId: course.id,
      amount,
      currency: "eur",
      status: "PENDING",
      stripeSessionId: session.id,
    },
  });

  return { kind: "stripe", redirectTo: session.url };
}

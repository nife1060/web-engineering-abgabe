/**
 * Hierhin schickt Stripe nach erfolgreichem Checkout. Problem: Der Browser
 * landet oft hier, bevor der Webhook (`@/app/api/webhooks/stripe`) die
 * Bestellung als PAID markiert hat. Deshalb zeigen wir erstmal einen
 * "Wird verarbeitet"-Zustand und laden die Seite automatisch neu, bis der
 * Status auf PAID (oder FAILED) steht.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { session_id: stripeSessionId } = await searchParams;

  if (!stripeSessionId) {
    return (
      <SuccessShell>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Missing session</h1>
        <p className="text-gray-600 mb-6 text-sm">No Stripe session id was provided.</p>
        <Link
          href="/courses"
          className="inline-flex bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm"
        >
          Back to courses
        </Link>
      </SuccessShell>
    );
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId },
    include: { course: { select: { id: true, title: true, thumbnailUrl: true } } },
  });

  if (!order || order.userId !== session.userId) {
    return (
      <SuccessShell>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Order not found</h1>
        <p className="text-gray-600 mb-6 text-sm">
          We could not find this order. If you just paid, try refreshing in a moment.
        </p>
        <Link
          href="/courses"
          className="inline-flex bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm"
        >
          Back to courses
        </Link>
      </SuccessShell>
    );
  }

  if (order.status === "PENDING") {
    return (
      <SuccessShell>
        {/* Automatische Aktualisierung alle 2s, bis der Webhook den Status auf PAID setzt */}
        <meta httpEquiv="refresh" content="2" />
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-5" />
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Processing your payment…</h1>
        <p className="text-gray-600 text-sm">
          This usually takes only a moment. We&apos;ll redirect you automatically.
        </p>
      </SuccessShell>
    );
  }

  if (order.status === "FAILED") {
    return (
      <SuccessShell>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment failed</h1>
        <p className="text-gray-600 text-sm mb-6">
          Your payment was not completed. You have not been charged.
        </p>
        <Link
          href={`/courses/${order.courseId}`}
          className="inline-flex bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm"
        >
          Back to course
        </Link>
      </SuccessShell>
    );
  }

  const invoiceLink = order.hostedInvoiceUrl ?? order.receiptUrl ?? null;

  return (
    <SuccessShell>
      <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
        ✓
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome aboard!</h1>
      <p className="text-gray-600 text-sm mb-6">
        You now have access to <strong className="text-gray-900">{order.course.title}</strong>.
      </p>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-sm text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Amount paid</span>
          <strong className="text-gray-900">€{order.amount.toFixed(2)}</strong>
        </div>
        <div className="flex justify-between">
          <span>Order ID</span>
          <span className="font-mono text-xs text-gray-500">{order.id}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href={`/learn/${order.courseId}`}
          className="block w-full text-center bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition text-sm"
        >
          Start Learning →
        </Link>
        {invoiceLink ? (
          <a
            href={invoiceLink}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm"
          >
            View receipt
          </a>
        ) : null}
      </div>
    </SuccessShell>
  );
}

function SuccessShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}

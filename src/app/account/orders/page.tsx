import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-200 text-gray-700",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        select: { id: true, title: true, thumbnailUrl: true },
      },
    },
  });

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">All your course purchases and their invoices.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <h2 className="font-bold text-gray-900 text-lg mb-2">No purchases yet</h2>
            <p className="text-gray-500 text-sm mb-5">Once you buy a course, it will appear here with its receipt.</p>
            <Link
              href="/courses"
              className="inline-flex bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Course</th>
                    <th className="text-right px-6 py-3">Amount</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-right px-6 py-3">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const invoiceLink = order.hostedInvoiceUrl ?? order.receiptUrl ?? null;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-700">{dateFormatter.format(order.createdAt)}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/courses/${order.course.id}`}
                            className="font-semibold text-gray-900 hover:text-purple-700 transition"
                          >
                            {order.course.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          €{order.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              statusStyles[order.status] ?? "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {invoiceLink ? (
                            <a
                              href={invoiceLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-600 hover:text-purple-800 text-xs font-bold"
                            >
                              View receipt
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

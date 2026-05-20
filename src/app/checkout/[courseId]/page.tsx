import { mockCourses } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = mockCourses.find((c) => c.id === courseId);
  if (!course) return notFound();

  const tax = +(course.price * 0.19).toFixed(2);
  const total = +(course.price + tax).toFixed(2);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href={`/courses/${course.id}`} className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1">
            ← Back to course
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Payment Form */}
          <div className="flex-1 space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">First name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Max" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Mustermann" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="max@example.com" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                Payment Details
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3 mb-4">
                  {["💳 Card", "PayPal", "Apple Pay"].map((method, i) => (
                    <button key={method} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition ${i === 0 ? "border-purple-600 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      {method}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Card number</label>
                  <div className="relative">
                    <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-14" />
                    <div className="absolute right-3 top-3 flex gap-1">
                      <span className="text-xs bg-gray-100 text-gray-500 px-1 rounded">VISA</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-1 rounded">MC</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry date</label>
                    <input type="text" placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVC</label>
                    <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name on card</label>
                  <input type="text" placeholder="Max Mustermann" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🔒</span>
              <span>Powered by <strong>Stripe</strong> · Your payment info is encrypted and secure</span>
            </div>

            <Link
              href="/dashboard"
              className="block w-full text-center bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition text-lg shadow-lg"
            >
              Complete Purchase · €{total}
            </Link>

            <p className="text-xs text-gray-400 text-center">30-day money-back guarantee. No questions asked.</p>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="flex gap-3 mb-5">
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{course.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{course.instructor}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Price</span>
                  <span>€{course.price}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (19%)</span>
                  <span>€{tax}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-4 text-base">
                <span>Total</span>
                <span>€{total}</span>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Coupon code</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="SAVE20" className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <button className="text-sm font-semibold text-purple-600 border border-purple-300 px-3 py-2 rounded-lg hover:bg-purple-50 transition">Apply</button>
                </div>
              </div>

              <ul className="mt-5 space-y-2 text-xs text-gray-500">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Full lifetime access</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Certificate of completion</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 30-day money-back guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

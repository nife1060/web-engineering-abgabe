import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join LearnHub for free today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">First name</label>
                <input type="text" placeholder="Max" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last name</label>
                <input type="text" placeholder="Mustermann" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input type="password" placeholder="Min. 8 characters" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 border-2 border-purple-600 rounded-xl cursor-pointer bg-purple-50">
                  <input type="radio" name="role" value="student" defaultChecked className="text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Student</p>
                    <p className="text-xs text-gray-500">Learn new skills</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition">
                  <input type="radio" name="role" value="creator" className="text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Creator</p>
                    <p className="text-xs text-gray-500">Teach & earn</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-0.5 rounded" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <span className="text-purple-600 font-medium cursor-pointer">Terms of Service</span>{" "}
                and{" "}
                <span className="text-purple-600 font-medium cursor-pointer">Privacy Policy</span>
              </label>
            </div>

            <Link href="/dashboard" className="block w-full text-center bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition">
              Create account
            </Link>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-800">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

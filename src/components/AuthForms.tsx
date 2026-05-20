"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginUser, registerUser, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Name
        </label>
        <input id="name" name="name" type="text" placeholder="Max Mustermann" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email address
        </label>
        <input id="email" name="email" type="email" placeholder="you@example.com" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Password
        </label>
        <input id="password" name="password" type="password" placeholder="Min. 8 characters" required className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">I want to join as</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ["USER", "User", "Learn skills"],
            ["CREATOR", "Creator", "Teach & earn"],
            ["ADMIN", "Admin", "Manage platform"],
          ].map(([value, label, description], index) => (
            <label
              key={value}
              className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition has-[:checked]:border-purple-600 has-[:checked]:bg-purple-50"
            >
              <input type="radio" name="role" value={value} defaultChecked={index === 0} className="text-purple-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="block w-full text-center bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition disabled:cursor-not-allowed disabled:bg-purple-300"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email address
        </label>
        <input id="email" name="email" type="email" placeholder="you@example.com" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Password
        </label>
        <input id="password" name="password" type="password" placeholder="Password" required className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="block w-full text-center bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition disabled:cursor-not-allowed disabled:bg-purple-300"
      >
        {pending ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-purple-600 font-semibold hover:text-purple-800">
          Sign up free
        </Link>
      </p>
    </form>
  );
}

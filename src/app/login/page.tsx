/** /login — drumherum ist hier nur Layout, die Formularlogik steckt in `@/components/AuthForms`. */

import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Learnify logo" width={56} height={56} className="mx-auto mb-4 h-14 w-14 object-contain" priority />
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Log in to your Learnify account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Back to{" "}
          <Link href="/" className="text-purple-600 font-semibold hover:text-purple-800">
            Learnify
          </Link>
        </p>
      </div>
    </div>
  );
}

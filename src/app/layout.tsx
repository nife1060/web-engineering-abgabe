import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import AutoTranslate from "@/components/AutoTranslate";
import Navbar from "@/components/Navbar";
import { normalizeLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Learnify",
  description: "Create and learn online courses with Learnify.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("learnify-locale")?.value);

  return (
    <html lang={locale}>
      <body className="bg-gray-50 min-h-screen">
        <AutoTranslate initialLocale={locale} />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

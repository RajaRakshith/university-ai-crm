import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UniConnect CRM",
  description: "AI-powered student–opportunity matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <Link href="/" className="font-semibold text-slate-800">
              UniConnect
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/student/upload" className="hover:text-slate-900">
                I&apos;m a student
              </Link>
              <Link href="/poster/new" className="hover:text-slate-900">
                I&apos;m looking for students
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

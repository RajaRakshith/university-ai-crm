import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniConnect CRM",
  description: "AI-powered CRM for cross-center student engagement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  );
}

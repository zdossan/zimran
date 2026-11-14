import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Disclaimer } from "@/components/legal/Disclaimer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Loan Guardian",
  description: "See your cheapest legal student-loan repayment plan in 60 seconds, then check your servicer's statements for errors. No login.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <header className="border-b">
          <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-semibold">Student Loan Guardian</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/check">Free check</Link>
              <Link href="/audit">Check a statement</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <Disclaimer variant="footer" />
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Geist_Mono, Manrope } from "next/font/google";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { BAND_TOP } from "@/components/brand/Band";
import "./globals.css";

// Manrope is a variable font: every weight 200–800 comes from one file.
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Loan Guardian",
  description: "See your cheapest legal student-loan repayment plan in 60 seconds, then check your servicer's statements for errors. No login.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable} h-full overflow-x-clip antialiased`}>
      <body className="min-h-full overflow-x-clip">
        {/* @container on a wrapper, not <body>: the full-bleed Band sizes itself in cqw (excludes the scrollbar),
            while portals (dialogs) and fixed elements render outside it — older Safari treats a size container
            as the containing block for position: fixed. */}
        <div className="@container flex min-h-dvh flex-col">
        <header className="text-white" style={{ background: BAND_TOP }}>
          <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
            <Link href="/" className="whitespace-nowrap font-extrabold tracking-tight">
              Student Loan Guardian
            </Link>
            <div className="flex gap-4 whitespace-nowrap text-sm font-semibold text-white/85">
              <Link href="/check" className="hidden hover:text-white sm:inline">
                Free check
              </Link>
              <Link href="/audit" className="hover:text-white">
                Check a statement
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <Disclaimer variant="footer" />
          </div>
        </footer>
        </div>
      </body>
    </html>
  );
}

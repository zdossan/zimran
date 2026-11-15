import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist_Mono, Poppins } from "next/font/google";
import { SiteHeader } from "@/components/brand/SiteHeader";
import { SiteFooter } from "@/components/brand/SiteFooter";
import "./globals.css";

// Poppins: geometric, light-weight UI type (rette.ai-style); it matches the round strokes of the Owen logo.
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Owen — your student loan guardian",
  description: "See your cheapest legal student-loan repayment plan in 60 seconds, then check your servicer's statements for errors. No login.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${geistMono.variable} h-full overflow-x-clip antialiased`}>
      <body className="min-h-full overflow-x-clip">
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          {/* No width cap here: each page sets its own container so full-bleed sections can span the screen. */}
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

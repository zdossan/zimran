"use client";
// Site footer: brand, links and the rules date. The long footer disclaimer was removed at the owner's request
// (2026-11-15); the page-level disclaimers (hero, results, paywall, audit, letters) are unchanged.
// Hidden inside the quiz (/check) so each step is one screen with nothing to scroll to.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand/SiteHeader";
import { RULES_DATE_LABEL } from "@/components/funnel/labels";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/check") return null;
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Brand />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-slate-700">
            <Link href="/check" className="py-2 hover:text-slate-900 hover:underline">
              Free check
            </Link>
            <Link href="/audit" className="py-2 hover:text-slate-900 hover:underline">
              Statement check
            </Link>
            <Link href="/paywall" className="py-2 hover:text-slate-900 hover:underline">
              Pricing
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-sm text-slate-600">Owen · Estimates only · Rules as of {RULES_DATE_LABEL}</p>
      </div>
    </footer>
  );
}

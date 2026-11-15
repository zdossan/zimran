"use client";
// Floating pill header (rette.ai-style): the logo, the navigation and the call to action each sit in their own
// frosted pill on desktop; on phones one pill holds the logo and the menu button. Inside the quiz (/check) it
// shows only the logo, so nothing pulls people out mid-way.
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { OwenLogo } from "@/components/brand/OwenLogo";
import { buttonClass } from "@/components/brand/kit";

const NAV = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Statement check", href: "/audit" },
  { label: "Pricing", href: "/paywall" },
];

const PILL = "rounded-full bg-white/85 shadow-[0_8px_30px_-12px_rgba(42,36,117,0.25)] ring-1 ring-slate-900/5 backdrop-blur";
// The phone pill (whole row) becomes three separate pills from md up.
const ROW =
  "rounded-full bg-white/85 shadow-[0_8px_30px_-12px_rgba(42,36,117,0.25)] ring-1 ring-slate-900/5 backdrop-blur py-1.5 pl-5 pr-2 md:rounded-none md:bg-transparent md:p-0 md:shadow-none md:ring-0 md:backdrop-blur-none";
const LOGO_PILL =
  "md:rounded-full md:bg-white/85 md:px-6 md:shadow-[0_8px_30px_-12px_rgba(42,36,117,0.25)] md:ring-1 md:ring-slate-900/5 md:backdrop-blur";

export function Brand() {
  return (
    <Link href="/" className="flex min-h-11 shrink-0 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
      <OwenLogo className="h-7 w-auto" />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Any navigation (brand link, back button) closes the menu: reset during render when the path changes
  // (React's "adjust state when a prop changes" pattern — no effect, no flash of the old state).
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }
  const showNav = pathname !== "/check";

  return (
    <header
      className="sticky top-0 z-40 px-3 pt-3 sm:px-6"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) setOpen(false);
      }}
    >
      <div className={`mx-auto flex max-w-6xl items-center justify-between gap-3 ${ROW}`}>
        <div data-pill className={`flex h-12 items-center md:h-14 ${LOGO_PILL}`}>
          <Brand />
        </div>
        {showNav ? (
          <>
            <nav aria-label="Main" data-pill className={`hidden h-14 items-center gap-1 px-3 md:flex ${PILL}`}>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-[15px] text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/check" className={buttonClass("primary", "hidden h-14 px-7 lg:inline-flex")}>
                Start the 60-second check
              </Link>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls={open ? "mobile-nav" : undefined}
                aria-label={open ? "Close menu" : "Open menu"}
                className="grid size-11 place-items-center rounded-full text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 md:hidden"
              >
                {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
              </button>
            </div>
          </>
        ) : null}
      </div>
      {showNav && open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="mx-auto mt-2 max-w-6xl rounded-[28px] bg-white p-3 shadow-[0_18px_50px_-24px_rgba(42,36,117,0.35)] ring-1 ring-slate-900/5 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-full px-4 text-base text-slate-800 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/check" onClick={() => setOpen(false)} className={buttonClass("primary", "mt-2 w-full")}>
            Start the 60-second check
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

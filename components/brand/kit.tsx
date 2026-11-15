// Small visual kit for the brand-on-paper look (ported from the owner's Bolt prototype).
// Plain class helpers and wrappers — interactive controls still use real elements or shadcn/ui.
import type { ReactNode } from "react";
import { cn } from "cn";

type Variant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-medium transition duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-700 text-white shadow-[0_10px_24px_-12px_rgba(72,64,187,0.8)] hover:bg-brand-800",
  secondary: "bg-white text-slate-900 shadow-[0_6px_24px_-10px_rgba(20,20,43,0.25)] ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
  ghost: "text-brand-800 hover:bg-brand-50",
};

/** Classes for a button-looking element (links and buttons alike). `extra` wins over the defaults. */
export function buttonClass(variant: Variant = "primary", extra = "") {
  return cn(BASE, VARIANTS[variant], extra);
}

export type BadgeTone = "neutral" | "primary" | "secondary" | "success" | "warning" | "error";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-800",
  primary: "bg-brand-100 text-brand-900",
  secondary: "bg-sky-100 text-sky-900",
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-900",
  error: "bg-red-100 text-red-900",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", BADGE_TONES[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[28px] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(42,36,117,0.25)] ring-1 ring-slate-900/5 sm:p-8", className)} {...rest}>
      {children}
    </div>
  );
}

/** Every piece of made-up data carries this. */
export function SampleTag() {
  return <Badge tone="secondary">Sample</Badge>;
}

/** Small uppercase label above a section heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.16em] text-brand-700", className)}>{children}</p>;
}

/** A product window (title bar with three dots) for showing a real, labelled sample of the app. */
export function AppWindow({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <div data-window className={cn("overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-30px_rgba(42,36,117,0.45)] ring-1 ring-slate-900/5", className)}>
      <div className="flex h-11 items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4">
        <span aria-hidden className="size-2.5 rounded-full bg-slate-300" />
        <span aria-hidden className="size-2.5 rounded-full bg-slate-300" />
        <span aria-hidden className="size-2.5 rounded-full bg-slate-300" />
        <span className="ml-2 truncate text-xs text-slate-500">{title}</span>
      </div>
      {children}
    </div>
  );
}

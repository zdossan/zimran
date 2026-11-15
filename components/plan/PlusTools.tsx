"use client";
// "Your tools" (Owen Plus): dispute tracker, income-change check, pay-extra planner and servicer call helper,
// as keyboard-accessible tabs (arrow keys move between them).
import { useRef, useState } from "react";
import type { PlanComparison } from "@/lib/types";
import { Card } from "@/components/brand/kit";
import { DisputeTracker } from "@/components/plan/DisputeTracker";
import { IncomeChange } from "@/components/plan/IncomeChange";
import { PayExtra } from "@/components/plan/PayExtra";
import { CallHelper } from "@/components/plan/CallHelper";

const TABS = [
  { id: "disputes", label: "Disputes" },
  { id: "income", label: "Income changed?" },
  { id: "extra", label: "Pay extra?" },
  { id: "call", label: "Call your servicer" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function PlusTools({ comparison, now }: { comparison: PlanComparison; now: Date }) {
  const [active, setActive] = useState<TabId>("disputes");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (delta: number) => {
    const i = TABS.findIndex((t) => t.id === active);
    const next = TABS[(i + delta + TABS.length) % TABS.length].id;
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="tools-heading" className="space-y-4">
      <div>
        <h3 id="tools-heading" className="text-xl font-semibold">
          Your tools
        </h3>
        <p className="text-sm text-slate-600">Track disputes, check a new income, plan extra payments and get ready to call your servicer.</p>
      </div>
      <Card className="p-0 sm:p-0">
        <div
          role="tablist"
          aria-label="Owen Plus tools"
          className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") move(1);
            if (e.key === "ArrowLeft") move(-1);
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={active === t.id ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm transition ${
                active === t.id ? "bg-brand-700 font-medium text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="p-4 sm:p-6">
          {active === "disputes" ? <DisputeTracker comparison={comparison} now={now} /> : null}
          {active === "income" ? <IncomeChange comparison={comparison} /> : null}
          {active === "extra" ? <PayExtra comparison={comparison} /> : null}
          {active === "call" ? <CallHelper now={now} /> : null}
        </div>
      </Card>
    </section>
  );
}

"use client";
// The paid plan hub (shown on /paywall once unlocked): each dated step with how to do it, its letter and a
// "done" tick; calendar reminders for every date; and the monthly check-in tracker.
import { useState } from "react";
import { CalendarPlus, Check } from "lucide-react";
import type { ActionItem, PlanComparison } from "@/lib/types";
import { Card, SampleTag, buttonClass } from "@/components/brand/kit";
import { HOW_TO } from "@/components/plan/howTo";
import { buildIcs } from "@/components/plan/ics";
import { LetterPanel } from "@/components/plan/LetterPanel";
import { Tracker } from "@/components/plan/Tracker";
import { PlusTools } from "@/components/plan/PlusTools";
import { loadDone, saveDone } from "@/components/plan/progress";
import { shortDate } from "@/components/funnel/labels";

const DAY = 86_400_000;

function when(due: string | undefined, now: Date): string {
  if (!due) return "Any time";
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((Date.parse(`${due}T00:00:00Z`) - today) / DAY);
  const rel = days === 0 ? "today" : days === 1 ? "tomorrow" : days > 1 ? `in ${days} days` : `${-days} day${days === -1 ? "" : "s"} ago`;
  return `${shortDate(due)} · ${rel}`;
}

function downloadCalendar(actions: ActionItem[], now: Date) {
  const url = URL.createObjectURL(new Blob([buildIcs(actions, now)], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "student-loan-guardian-plan.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PlanHub({
  comparison,
  actions,
  now = new Date(),
  isSample = false,
}: {
  comparison: PlanComparison;
  actions: ActionItem[];
  now?: Date;
  isSample?: boolean;
}) {
  const [done, setDone] = useState<string[]>(() => loadDone());
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    saveDone(next);
  };
  const doneCount = actions.filter((a) => done.includes(a.id)).length;

  return (
    <div data-testid="plan-hub" className="space-y-8">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-medium tracking-tight">Your progress</h2>
          {isSample ? <SampleTag /> : null}
        </div>
        <div>
          <p className="text-base font-semibold">
            {doneCount} of {actions.length} done
          </p>
          <div aria-hidden className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand-700 transition-all" style={{ width: `${actions.length ? Math.round((doneCount / actions.length) * 100) : 0}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="button" className={buttonClass("primary", "w-full sm:w-auto")} onClick={() => downloadCalendar(actions, now)}>
            <CalendarPlus aria-hidden className="size-4" />
            Add all dates to my calendar
          </button>
          <p className="text-sm text-slate-600">Reminders a week and a day before each date, plus a monthly statement check.</p>
        </div>
      </Card>

      <ol className="space-y-4">
        {actions.map((a) => {
          const isDone = done.includes(a.id);
          const how = HOW_TO[a.id];
          return (
            <li key={a.id} data-testid={`step-${a.id}`}>
              <Card className={`space-y-4 p-5 sm:p-6 ${isDone ? "bg-slate-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <input
                    id={`done-${a.id}`}
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggle(a.id)}
                    aria-label={`Mark done: ${a.title}`}
                    className="mt-1 size-5 shrink-0 accent-brand-700"
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-brand-800">{when(a.dueDate, now)}</p>
                    <p className={`text-lg font-semibold ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}>{a.title}</p>
                    <p className="text-sm text-slate-700">{a.detail}</p>
                    {isDone ? (
                      <p className="flex items-center gap-1 text-sm font-semibold text-emerald-800">
                        <Check aria-hidden className="size-4" />
                        Done
                      </p>
                    ) : null}
                  </div>
                </div>
                {how ? (
                  <details className="rounded-xl border border-slate-200 px-4 py-2">
                    <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-brand-800">How to do it</summary>
                    <ol className="mt-2 list-decimal space-y-2 pb-3 pl-5 text-sm text-slate-700">
                      {how.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    {how.link ? (
                      <a href={how.link.href} target="_blank" rel="noreferrer" className="mb-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand-800 underline underline-offset-4">
                        {how.link.label}
                      </a>
                    ) : null}
                  </details>
                ) : null}
                {a.letterTemplateId ? <LetterPanel id={a.letterTemplateId} comparison={comparison} now={now} /> : null}
              </Card>
            </li>
          );
        })}
      </ol>

      <PlusTools comparison={comparison} now={now} />

      <Tracker comparison={comparison} now={now} />
    </div>
  );
}

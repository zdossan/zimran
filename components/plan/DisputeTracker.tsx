"use client";
// Dispute tracker (Owen Plus): each statement error the borrower wrote about, with the next step and its date —
// wait 30 days, send the follow-up letter, then the CFPB and the FSA Ombudsman — until it's fixed.
import { useState } from "react";
import { CalendarPlus, Plus } from "lucide-react";
import type { PlanComparison } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { parseMoney } from "@/components/funnel/mapping";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { Badge, buttonClass } from "@/components/brand/kit";
import { LetterPanel } from "@/components/plan/LetterPanel";
import { buildIcs } from "@/components/plan/ics";
import { followUpLetter, isoToday, newDispute, nextStep, totalRecovered, type Dispute } from "@/components/plan/disputes";
import { loadCalls, loadDisputes, saveDisputes } from "@/components/plan/progress";

const FIELD = "mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100";
const STATUS: Record<Dispute["status"], { label: string; tone: "warning" | "primary" | "error" | "success" }> = {
  sent: { label: "Letter sent", tone: "primary" },
  followed_up: { label: "Followed up", tone: "warning" },
  escalated: { label: "Complaint filed", tone: "error" },
  fixed: { label: "Fixed", tone: "success" },
};

function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function AddDispute({ now, onAdd }: { now: Date; onAdd: (d: Dispute) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [servicer, setServicer] = useState("");
  const [amount, setAmount] = useState("");
  const [sentOn, setSentOn] = useState(isoToday(now));
  if (!open) {
    return (
      <button type="button" className={buttonClass("secondary", "text-sm")} onClick={() => setOpen(true)}>
        <Plus aria-hidden className="size-4" />
        Add a dispute
      </button>
    );
  }
  return (
    <form
      className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(newDispute({ title: title.trim(), servicer: servicer.trim() || undefined, amount: parseMoney(amount) ?? undefined, sentOn }));
        setOpen(false);
        setTitle("");
        setAmount("");
      }}
    >
      <label className="text-sm font-semibold sm:col-span-2">
        What&apos;s wrong
        <input className={FIELD} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Interest subsidy short by $40.10" required />
      </label>
      <label className="text-sm font-semibold">
        Servicer
        <input className={FIELD} value={servicer} onChange={(e) => setServicer(e.target.value)} placeholder="MOHELA" />
      </label>
      <label className="text-sm font-semibold">
        Amount in question
        <input className={FIELD} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="40.10" />
      </label>
      <label className="text-sm font-semibold">
        Date you sent the letter
        <input className={FIELD} type="date" value={sentOn} onChange={(e) => setSentOn(e.target.value)} />
      </label>
      <div className="flex items-end">
        <button type="submit" className={buttonClass("primary", "w-full text-sm")}>
          Start tracking
        </button>
      </div>
    </form>
  );
}

function DisputeCard({ d, now, comparison, onChange }: { d: Dispute; now: Date; comparison: PlanComparison; onChange: (d: Dispute) => void }) {
  const [letter, setLetter] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [recovered, setRecovered] = useState(d.amount ? String(d.amount) : "");
  const step = nextStep(d, now);
  const today = isoToday(now);
  const status = STATUS[d.status];

  return (
    <li data-testid={`dispute-${d.id}`} className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{d.title}</p>
          <p className="text-sm text-slate-600">
            {d.servicer ?? "Servicer"}
            {d.amount ? ` · ${formatUSD(d.amount)}` : ""}
          </p>
        </div>
        <Badge tone={status.tone} className="text-xs">
          {status.label}
        </Badge>
      </div>
      <p className={`text-sm font-medium ${step.kind === "follow_up" || step.kind === "escalate" ? "text-amber-800" : "text-slate-700"}`}>{step.text}</p>

      <div className="flex flex-wrap gap-2">
        {step.kind === "wait" && step.due ? (
          <button
            type="button"
            className={buttonClass("ghost", "px-3 text-sm")}
            onClick={() =>
              download(
                buildIcs([{ id: `dispute-${d.id}`, dueDate: step.due, title: `Check your dispute: ${d.title}`, detail: "If it isn't fixed, send the follow-up letter from your Owen plan." }], now, { monthly: false }),
                "owen-dispute-reminder.ics",
              )
            }
          >
            <CalendarPlus aria-hidden className="size-4" />
            Add reminder to my calendar
          </button>
        ) : null}
        {step.kind === "follow_up" ? (
          <>
            <button type="button" className={buttonClass("secondary", "text-sm")} aria-expanded={letter} onClick={() => setLetter((o) => !o)}>
              Get the follow-up letter
            </button>
            <button type="button" className={buttonClass("secondary", "text-sm")} onClick={() => onChange({ ...d, status: "followed_up", followedUpOn: today })}>
              I sent the follow-up
            </button>
          </>
        ) : null}
        {step.kind === "escalate" ? (
          <>
            <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noreferrer" className={buttonClass("secondary", "text-sm")}>
              File with the CFPB
            </a>
            <a href="https://studentaid.gov/feedback-ombudsman" target="_blank" rel="noreferrer" className={buttonClass("secondary", "text-sm")}>
              Contact the FSA Ombudsman
            </a>
            <button type="button" className={buttonClass("secondary", "text-sm")} onClick={() => onChange({ ...d, status: "escalated", escalatedOn: today })}>
              I filed the complaint
            </button>
          </>
        ) : null}
        {d.status !== "fixed" ? (
          <button type="button" className={buttonClass("ghost", "px-3 text-sm")} onClick={() => setFixing((o) => !o)}>
            Mark fixed
          </button>
        ) : null}
      </div>

      {step.kind === "escalate" ? <LetterPanel id="cfpb_complaint" comparison={comparison} servicer={d.servicer} now={now} /> : null}

      {letter && step.kind === "follow_up" ? (
        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs leading-relaxed text-slate-800">{followUpLetter(d, loadCalls(), now)}</pre>
          <Disclaimer variant="letter" />
        </div>
      ) : null}

      {fixing && d.status !== "fixed" ? (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onChange({ ...d, status: "fixed", recovered: parseMoney(recovered) ?? undefined });
            setFixing(false);
          }}
        >
          <label className="text-sm font-semibold">
            Amount corrected
            <input className={`${FIELD} w-36`} inputMode="decimal" value={recovered} onChange={(e) => setRecovered(e.target.value)} />
          </label>
          <button type="submit" className={buttonClass("primary", "text-sm")}>
            Save
          </button>
        </form>
      ) : null}
    </li>
  );
}

export function DisputeTracker({ comparison, now }: { comparison: PlanComparison; now: Date }) {
  const [disputes, setDisputes] = useState<Dispute[]>(() => loadDisputes());
  const update = (next: Dispute[]) => {
    setDisputes(next);
    saveDisputes(next);
  };
  const recovered = totalRecovered(disputes);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Send the letter, then track it here. We tell you when to follow up and when to escalate.</p>
        {disputes.length ? (
          <p className="text-sm text-slate-700">
            Recovered so far:{" "}
            <span data-testid="recovered-total" className="font-semibold text-emerald-800">
              {formatUSD(recovered)}
            </span>
          </p>
        ) : null}
      </div>
      {disputes.length ? (
        <ul className="space-y-3">
          {disputes.map((d) => (
            <DisputeCard key={d.id} d={d} now={now} comparison={comparison} onChange={(n) => update(disputes.map((x) => (x.id === n.id ? n : x)))} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">No disputes yet. When a statement check finds an error, send the letter and track it here.</p>
      )}
      <AddDispute now={now} onAdd={(d) => update([d, ...disputes])} />
    </div>
  );
}

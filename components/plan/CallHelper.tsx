"use client";
// "Call your servicer" (Owen Plus): what to say for the problem at hand, and a log of every call — the date,
// who you spoke with and the reference number — which the dispute follow-up letter quotes.
import { useState } from "react";
import { PhoneCall, ShieldAlert } from "lucide-react";
import { buttonClass } from "@/components/brand/kit";
import { shortDate } from "@/components/funnel/labels";
import { CALL_SAFETY, CALL_SCRIPTS, CALL_TOPICS, type CallLog, type CallTopic } from "@/components/plan/calls";
import { isoToday } from "@/components/plan/disputes";
import { loadCalls, loadDisputes, saveCalls } from "@/components/plan/progress";

const FIELD = "mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100";

export function CallHelper({ now }: { now: Date }) {
  const [topic, setTopic] = useState<CallTopic>("switch_plan");
  const [calls, setCalls] = useState<CallLog[]>(() => loadCalls());
  const [disputes] = useState(() => loadDisputes().filter((d) => d.status !== "fixed"));
  const [on, setOn] = useState(isoToday(now));
  const [rep, setRep] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [disputeId, setDisputeId] = useState("");
  const script = CALL_SCRIPTS[topic];

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">What are you calling about?</legend>
        <div className="flex flex-wrap gap-2">
          {CALL_TOPICS.map((t) => (
            <label
              key={t}
              className={`flex min-h-11 cursor-pointer items-center rounded-full px-4 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${topic === t ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              <input type="radio" name="call-topic" value={t} checked={topic === t} onChange={() => setTopic(t)} className="sr-only" />
              {CALL_SCRIPTS[t].title}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl bg-brand-50 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
          <PhoneCall aria-hidden className="size-4" />
          What to say
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-800">
          {script.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-600">
          <ShieldAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {CALL_SAFETY}
        </p>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const log: CallLog = {
            id: `c-${Date.now().toString(36)}`,
            on,
            topic,
            rep: rep.trim() || undefined,
            reference: reference.trim() || undefined,
            notes: notes.trim() || undefined,
            disputeId: disputeId || undefined,
          };
          const next = [log, ...calls];
          setCalls(next);
          saveCalls(next);
          setRep("");
          setReference("");
          setNotes("");
        }}
      >
        <p className="text-sm font-semibold sm:col-span-2">After the call, log it</p>
        <label className="text-sm font-semibold">
          Date of the call
          <input className={FIELD} type="date" value={on} onChange={(e) => setOn(e.target.value)} />
        </label>
        <label className="text-sm font-semibold">
          Who you spoke with
          <input className={FIELD} value={rep} onChange={(e) => setRep(e.target.value)} placeholder="First name" />
        </label>
        <label className="text-sm font-semibold">
          Reference number
          <input className={FIELD} value={reference} onChange={(e) => setReference(e.target.value)} />
        </label>
        {disputes.length ? (
          <label className="text-sm font-semibold">
            About a dispute?
            <select className={FIELD} value={disputeId} onChange={(e) => setDisputeId(e.target.value)}>
              <option value="">No</option>
              {disputes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="text-sm font-semibold sm:col-span-2">
          What they said
          <input className={FIELD} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Will be fixed in 2 weeks" />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className={buttonClass("primary", "text-sm")}>
            Log this call
          </button>
        </div>
      </form>

      {calls.length ? (
        <section aria-label="Your calls">
          <p className="mb-2 text-sm font-semibold">Your calls</p>
          <ul className="space-y-2">
            {calls.map((c) => (
              <li key={c.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {shortDate(c.on)} · {CALL_SCRIPTS[c.topic].title}
                <span className="block text-slate-900">
                  {[c.rep, c.reference].filter(Boolean).join(" · ") || "No name or reference"}
                  {c.notes ? ` — ${c.notes}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

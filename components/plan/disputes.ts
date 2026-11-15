// Dispute tracker: a statement error the borrower has written to their servicer about, followed through
// 30-day waits, a follow-up letter, then a CFPB complaint and the FSA Ombudsman, until it's fixed.
import { formatUSD, round2 } from "@/lib/format";
import { addDays, shortDate } from "@/lib/engine/dates";
import { addressBlock, longDate } from "@/lib/letters/templates";
import type { CallLog } from "@/components/plan/calls";

export type DisputeStatus = "sent" | "followed_up" | "escalated" | "fixed";

export interface Dispute {
  id: string;
  title: string;
  servicer?: string;
  amount?: number;
  sentOn: string; // ISO date the first letter was sent
  followedUpOn?: string;
  escalatedOn?: string;
  status: DisputeStatus;
  recovered?: number;
}

export type NextStep = { kind: "wait" | "follow_up" | "escalate" | "waiting_escalation" | "done"; text: string; due?: string };

const WAIT_DAYS = 30;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const dateOf = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

export function newDispute(input: { title: string; servicer?: string; amount?: number; sentOn: string }, id = `d-${Date.now().toString(36)}`): Dispute {
  return { id, title: input.title, servicer: input.servicer, amount: input.amount, sentOn: input.sentOn, status: "sent" };
}

export function nextStep(d: Dispute, now: Date): NextStep {
  const today = iso(now);
  const who = d.servicer ?? "your servicer";
  if (d.status === "fixed") return { kind: "done", text: d.recovered ? `Fixed · ${formatUSD(d.recovered)} back` : "Fixed" };
  if (d.status === "escalated") return { kind: "waiting_escalation", text: "Complaint sent. Mark it fixed when your account is corrected." };
  if (d.status === "followed_up") {
    const due = addDays(d.followedUpOn ?? d.sentOn, WAIT_DAYS);
    return today < due
      ? { kind: "wait", due, text: `Give ${who} until ${shortDate(due)} to answer your follow-up.` }
      : { kind: "escalate", due, text: "Still not fixed. File a complaint with the CFPB and contact the Federal Student Aid Ombudsman." };
  }
  const due = addDays(d.sentOn, WAIT_DAYS);
  return today < due
    ? { kind: "wait", due, text: `Give ${who} until ${shortDate(due)} to answer.` }
    : { kind: "follow_up", due, text: "No fix after 30 days. Send the follow-up letter, and call your servicer." };
}

export function totalRecovered(disputes: Dispute[]): number {
  return round2(disputes.reduce((sum, d) => (d.status === "fixed" && d.recovered ? sum + d.recovered : sum), 0));
}

/** A follow-up letter citing the first letter and every call logged for this dispute. */
export function followUpLetter(d: Dispute, calls: CallLog[], today: Date): string {
  const mine = calls.filter((c) => c.disputeId === d.id).sort((a, b) => a.on.localeCompare(b.on));
  const callLines = mine.length
    ? [
        "",
        "I also called you about this:",
        ...mine.map(
          (c) =>
            `- ${longDate(dateOf(c.on))}: I spoke with ${c.rep || "a representative"}${c.reference ? `, reference number ${c.reference}` : ""}${c.notes ? ` (${c.notes})` : ""}.`,
        ),
      ]
    : [];
  return [
    addressBlock(today, d.servicer),
    "",
    `Re: Follow-up — ${d.title}`,
    "",
    `On ${longDate(dateOf(d.sentOn))} I wrote to you about a possible error on my federal student loan billing statement: ${d.title}${d.amount ? ` (${formatUSD(d.amount)})` : ""}. I have not received a written answer, and my account has not been corrected.`,
    ...callLines,
    "",
    "Please correct my account, including any interest or fees charged because of the error, and send me a written answer within 30 days.",
    "",
    "If this isn't resolved, I will send a complaint to the Consumer Financial Protection Bureau and contact the Federal Student Aid Ombudsman.",
    "",
    "Thank you,",
    "[YOUR NAME]",
  ].join("\n");
}

export const isoToday = iso;

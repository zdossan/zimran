// What the paid plan remembers on this device: steps done, statement checks over time, and the qualifying
// payment count. Browser storage only (no account); every read survives junk or blocked storage.
import type { AuditResult } from "@/lib/types";
import { round2 } from "@/lib/format";
import type { Dispute } from "@/components/plan/disputes";
import type { CallLog } from "@/components/plan/calls";

const DISPUTES = "slg_disputes";
const CALLS = "slg_calls";
const DONE = "slg_plan_done";
const HISTORY = "slg_audit_history";
const PAYMENTS = "slg_plan_payments";
const MAX_HISTORY = 24;

export type AuditEntry = {
  checkedOn: string;
  servicer?: string;
  errors: number;
  warnings: number;
  found: number;
  // From the statement itself, for the dashboard (optional: older entries don't have them).
  balance?: number;
  amountDue?: number;
  dueDate?: string;
  statementDate?: string;
};

function read<T>(key: string, ok: (v: unknown) => v is T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const v: unknown = JSON.parse(raw);
    return ok(v) ? v : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the plan still works, it just won't remember.
  }
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 1000;
const isEntry = (v: unknown): v is AuditEntry => {
  const e = v as AuditEntry | null;
  return !!e && typeof e.checkedOn === "string" && typeof e.errors === "number" && typeof e.warnings === "number" && typeof e.found === "number";
};
const isHistory = (v: unknown): v is AuditEntry[] => Array.isArray(v) && v.every(isEntry);

export const loadDone = (): string[] => read(DONE, isStringArray) ?? [];
export const saveDone = (ids: string[]) => write(DONE, ids);

export const loadPayments = (): number | null => read(PAYMENTS, isCount);
export const savePayments = (n: number) => write(PAYMENTS, n);

export const loadAuditHistory = (): AuditEntry[] => read(HISTORY, isHistory) ?? [];

/** One statement check in a line: possible errors, and how much money they add up to. */
export function auditSummary(result: AuditResult, now: Date): AuditEntry {
  const errors = result.findings.filter((f) => f.severity === "error");
  const found = errors.reduce((sum, f) => (f.expected !== undefined && f.actual !== undefined ? sum + Math.abs(f.expected - f.actual) : sum), 0);
  return {
    checkedOn: now.toISOString().slice(0, 10),
    servicer: result.extraction.servicer,
    errors: errors.length,
    warnings: result.findings.filter((f) => f.severity === "warn").length,
    found: round2(found),
    balance: result.extraction.principalBalance,
    amountDue: result.extraction.amountDue,
    dueDate: result.extraction.dueDate,
    statementDate: result.extraction.statementDate,
  };
}

/** Adds a real statement check to the history (newest first). Sample statements are never recorded. */
export function recordAudit(result: AuditResult, now: Date) {
  if (result.extraction.isSample) return;
  write(HISTORY, [auditSummary(result, now), ...loadAuditHistory()].slice(0, MAX_HISTORY));
}

const isDisputeList = (v: unknown): v is Dispute[] =>
  Array.isArray(v) && v.every((d) => !!d && typeof (d as Dispute).id === "string" && typeof (d as Dispute).title === "string" && typeof (d as Dispute).sentOn === "string" && typeof (d as Dispute).status === "string");
const isCallList = (v: unknown): v is CallLog[] =>
  Array.isArray(v) && v.every((c) => !!c && typeof (c as CallLog).id === "string" && typeof (c as CallLog).on === "string" && typeof (c as CallLog).topic === "string");

export const loadDisputes = (): Dispute[] => read(DISPUTES, isDisputeList) ?? [];
export const saveDisputes = (d: Dispute[]) => write(DISPUTES, d);
export const loadCalls = (): CallLog[] => read(CALLS, isCallList) ?? [];
export const saveCalls = (c: CallLog[]) => write(CALLS, c);

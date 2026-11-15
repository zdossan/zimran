// Calendar reminders (RFC 5545 .ics) for the dated action plan: one all-day event per dated step with
// alerts a week and a day before, plus a monthly "check your statement" reminder for a year.
// Works with Apple/Google/Outlook calendars, no email or account needed.
import type { ActionItem } from "@/lib/types";

const PRODID = "-//Owen//Dated action plan//EN";
const DOMAIN = "student-loan-guardian.vercel.app";

const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const ymd = (iso: string) => iso.replace(/-/g, "");
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Folds a content line to ≤ 75 characters; continuation lines start with one space. */
function fold(line: string): string[] {
  if (line.length <= 75) return [line];
  const out = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) out.push(` ${line.slice(i, i + 74)}`);
  return out;
}

function alarm(trigger: string, text: string): string[] {
  return ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escape(text)}`, `TRIGGER:${trigger}`, "END:VALARM"];
}

export function buildIcs(actions: ActionItem[], now: Date, opts: { monthly?: boolean } = {}): string {
  const dtstamp = stamp(now);
  const lines: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:${PRODID}`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];

  for (const a of actions) {
    if (!a.dueDate) continue;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${a.id}-${ymd(a.dueDate)}@${DOMAIN}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${ymd(a.dueDate)}`,
      `DTEND;VALUE=DATE:${ymd(nextDay(a.dueDate))}`,
      `SUMMARY:${escape(a.title)}`,
      `DESCRIPTION:${escape(`${a.detail}\nFrom your Owen plan. Estimates only.`)}`,
      ...alarm("-P7D", `In a week: ${a.title}`),
      ...alarm("-P1D", `Tomorrow: ${a.title}`),
      "END:VEVENT",
    );
  }

  if (opts.monthly === false) {
    lines.push("END:VCALENDAR");
    return lines.flatMap(fold).join("\r\n") + "\r\n";
  }

  const first = new Date(now);
  first.setUTCMonth(first.getUTCMonth() + 1);
  const firstIso = first.toISOString().slice(0, 10);
  lines.push(
    "BEGIN:VEVENT",
    `UID:statement-check-${ymd(firstIso)}@${DOMAIN}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${ymd(firstIso)}`,
    `DTEND;VALUE=DATE:${ymd(nextDay(firstIso))}`,
    "RRULE:FREQ=MONTHLY;COUNT=12",
    "SUMMARY:Check this month's student loan statement",
    `DESCRIPTION:${escape("Upload your new statement to the statement check to catch billing errors.")}`,
    ...alarm("PT9H", "Check this month's student loan statement"),
    "END:VEVENT",
    "END:VCALENDAR",
  );

  return lines.flatMap(fold).join("\r\n") + "\r\n";
}

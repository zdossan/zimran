// ISO date helpers (YYYY-MM-DD), always in UTC so results don't shift with the viewer's time zone.

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** True for a real calendar date written YYYY-MM-DD. */
export const isIsoDate = (s?: string): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(`${s}T00:00:00Z`));

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

/** "2026-11-30" → "Nov 30, 2026". */
export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

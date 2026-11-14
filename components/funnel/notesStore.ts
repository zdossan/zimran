// Notes from the quiz (e.g. the July-2014 "not sure" assumption) for the results page.
// The funnel keeps them under its own key; session.ts (P4) only stores the BorrowerInput.
const KEY = "slg_funnel_notes";

export function saveFunnelNotes(notes: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    // Private mode or storage disabled: the notes are a nicety, not required.
  }
}

export function loadFunnelNotes(): string[] {
  try {
    const v: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

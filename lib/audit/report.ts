// One-page (overflowing to more if needed) "Guardian report" PDF built with pdf-lib.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ActionItem, AuditFinding, AuditResult } from "@/lib/types";
import { formatUSD } from "@/lib/format";

// docs/research/08 §H 6.6 (audit results), plus the affiliation line.
export const REPORT_DISCLAIMER =
  "We flag possible discrepancies by comparing your statement with the information you provided and with federal rules as of November 1, 2026. A flag is not a finding that your servicer made an error, and it does not affect your credit report. Confirm with your servicer, using the template if you like. If the issue isn't resolved, you can contact the Federal Student Aid Ombudsman for free. Student Loan Guardian is not affiliated with the U.S. Department of Education.";

const WIN_ANSI_EXTRAS = new Set("—–‘’“”•…€™");
const REPLACE: Record<string, string> = { "−": "-", "≥": ">=", "≤": "<=", "→": "->", "✓": "", "≈": "~" };

/** Standard PDF fonts only encode WinAnsi; map or drop anything else. */
export function toWinAnsi(s: string): string {
  let out = "";
  for (const ch of s) {
    if (REPLACE[ch] !== undefined) out += REPLACE[ch];
    else if (ch.charCodeAt(0) <= 0xff || WIN_ANSI_EXTRAS.has(ch)) out += ch;
  }
  return out;
}

const MARGIN = 54;
const WIDTH = 612;
const HEIGHT = 792;

class Writer {
  page: PDFPage;
  y = HEIGHT - MARGIN;
  constructor(private doc: PDFDocument, private font: PDFFont, private bold: PDFFont) {
    this.page = doc.addPage([WIDTH, HEIGHT]);
  }
  private ensure(h: number) {
    if (this.y - h < MARGIN) {
      this.page = this.doc.addPage([WIDTH, HEIGHT]);
      this.y = HEIGHT - MARGIN;
    }
  }
  text(raw: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; gap?: number } = {}) {
    const size = opts.size ?? 10;
    const font = opts.bold ? this.bold : this.font;
    const indent = opts.indent ?? 0;
    const maxW = WIDTH - 2 * MARGIN - indent;
    const words = toWinAnsi(raw).split(/\s+/).filter(Boolean);
    let line = "";
    const flush = () => {
      if (!line) return;
      this.ensure(size + 4);
      this.page.drawText(line, { x: MARGIN + indent, y: this.y - size, size, font, color: rgb(...(opts.color ?? [0, 0, 0])) });
      this.y -= size + 4;
      line = "";
    };
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) > maxW && line) {
        flush();
        line = w;
      } else {
        line = next;
      }
    }
    flush();
    this.y -= opts.gap ?? 2;
  }
}

const LABEL: Record<AuditFinding["severity"], { tag: string; color: [number, number, number] }> = {
  error: { tag: "POSSIBLE ERROR", color: [0.75, 0.1, 0.1] },
  warn: { tag: "CHECK", color: [0.7, 0.45, 0] },
  ok: { tag: "OK", color: [0.1, 0.5, 0.2] },
};

export async function buildGuardianReport(result: AuditResult, actions: ActionItem[] = []): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Guardian report");
  doc.setProducer("Student Loan Guardian");
  const w = new Writer(doc, await doc.embedFont(StandardFonts.Helvetica), await doc.embedFont(StandardFonts.HelveticaBold));
  const x = result.extraction;

  w.text("Guardian report", { size: 20, bold: true, gap: 6 });
  w.text(`${x.servicer} · statement dated ${x.statementDate || "unknown"} · due ${x.dueDate} · amount due ${formatUSD(x.amountDue)}`, { size: 10 });
  w.text("Rules as of November 1, 2026", { size: 9, color: [0.4, 0.4, 0.4], gap: x.isSample ? 2 : 12 });
  if (x.isSample) w.text("SAMPLE DATA - not a real statement", { size: 9, bold: true, color: [0.75, 0.1, 0.1], gap: 12 });

  w.text("What we checked", { size: 13, bold: true, gap: 6 });
  for (const f of result.findings) {
    const l = LABEL[f.severity];
    w.text(`[${l.tag}] ${f.title}`, { size: 11, bold: true, color: l.color });
    w.text(f.detail, { size: 9, indent: 12 });
    const nums = [
      f.expected !== undefined ? `Expected ${formatUSD(f.expected)}` : "",
      f.actual !== undefined ? `On statement ${formatUSD(f.actual)}` : "",
      `Rule: ${f.ruleRef}`,
    ].filter(Boolean);
    w.text(nums.join(" · "), { size: 9, indent: 12, color: [0.35, 0.35, 0.35], gap: 10 });
  }

  if (actions.length) {
    w.text("Your next steps", { size: 13, bold: true, gap: 6 });
    for (const a of actions) {
      w.text(`${a.dueDate ? `${a.dueDate}  ` : ""}${a.title}`, { size: 10, bold: true });
      w.text(a.detail, { size: 9, indent: 12, gap: 8 });
    }
  }

  w.text(REPORT_DISCLAIMER, { size: 8, color: [0.4, 0.4, 0.4] });
  return doc.save();
}

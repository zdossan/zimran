// Generates the labelled SAMPLE statements in public/samples/ from lib/audit/samples.ts.
// Run: npx tsx scripts/make-samples.ts
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from "pdf-lib";
import { SAMPLE_EXTRACTIONS } from "../lib/audit/samples";
import { formatUSD } from "../lib/format";
import type { StatementExtraction } from "../lib/types";

const MARK = "SAMPLE - NOT A REAL STATEMENT";
const OUT = path.join(process.cwd(), "public", "samples");

type Labels = { date: string; due: string; amountDue: string; principal: string; rate: string; toInterest: string; toPrincipal: string };
const LABELS: Record<string, Labels> = {
  "mohela-subsidy-error": {
    date: "Date Billed", due: "Date Due", amountDue: "Current Due", principal: "Balance", rate: "Int Rate",
    toInterest: "Interest Paid Since Last Statement", toPrincipal: "Principal Paid Since Last Statement",
  },
  "edfinancial-ok": {
    date: "Statement Date", due: "Current Statement Due Date", amountDue: "Current Amount Due", principal: "Unpaid Principal",
    rate: "Interest Rate", toInterest: "Applied to Interest", toPrincipal: "Applied to Principal",
  },
  "nelnet-standard-placement": {
    date: "Statement Date", due: "Current Statement Due Date", amountDue: "Current Amount Due", principal: "Outstanding Principal Balance",
    rate: "Interest Rate", toInterest: "Applied to Interest", toPrincipal: "Applied to Principal",
  },
};

const pretty = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

function row(page: PDFPage, font: PDFFont, bold: PDFFont, y: number, label: string, value: string) {
  page.drawText(label, { x: 56, y, size: 10, font, color: rgb(0.25, 0.25, 0.25) });
  page.drawText(value, { x: 360, y, size: 10, font: bold });
}

async function render(id: string, x: StatementExtraction): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${x.servicer} billing statement (${MARK})`);
  doc.setProducer("Student Loan Guardian sample generator");
  // Plain-text marker on the document catalog so tools (and our test) can verify the label.
  doc.catalog.set(PDFName.of("SampleNotice"), PDFString.of(MARK));

  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const L = LABELS[id];

  page.drawText(MARK, { x: 90, y: 230, size: 34, font: bold, color: rgb(0.9, 0.2, 0.2), opacity: 0.25, rotate: degrees(40) });
  page.drawText(x.servicer, { x: 56, y: 740, size: 18, font: bold });
  page.drawText("Federal Student Loan Billing Statement", { x: 56, y: 720, size: 11, font });
  page.drawText(MARK, { x: 56, y: 702, size: 10, font: bold, color: rgb(0.85, 0.1, 0.1) });
  page.drawText("Jordan Sample  ·  123 Example St  ·  Columbus, OH 43215  ·  Account ending 0000", { x: 56, y: 680, size: 9, font });

  let y = 640;
  const line = (label: string, value: string) => {
    row(page, font, bold, y, label, value);
    y -= 20;
  };
  line(L.date, pretty(x.statementDate));
  line(L.due, pretty(x.dueDate));
  line(L.amountDue, formatUSD(x.amountDue));
  if (x.planName) line("Repayment Plan", x.planName);
  if (x.planName === "STANDARD") line("Loan Term (payments remaining)", "120");
  if (x.loanStatus) line("Status", x.loanStatus);
  line(L.principal, formatUSD(x.principalBalance));
  if (x.interestRate !== undefined) line(L.rate, `${(x.interestRate * 100).toFixed(2)}%`);

  if (x.lastPayment || x.monthlyInterestAccrued !== undefined) {
    y -= 10;
    page.drawText("Activity Since Last Statement", { x: 56, y, size: 12, font: bold });
    y -= 24;
    if (x.lastPayment) {
      line("Payment Received", `${formatUSD(x.lastPayment.amount)} on ${pretty(x.lastPayment.date)}`);
      line(L.toInterest, formatUSD(x.lastPayment.toInterest));
      line(L.toPrincipal, formatUSD(x.lastPayment.toPrincipal));
    }
    if (x.monthlyInterestAccrued !== undefined) line("Interest Accrued This Period", formatUSD(x.monthlyInterestAccrued));
    if (x.lastPayment?.subsidyApplied !== undefined) line("RAP Interest Subsidy Applied", formatUSD(x.lastPayment.subsidyApplied));
    if (x.lastPayment?.matchApplied !== undefined) line("RAP Principal Match Applied", formatUSD(x.lastPayment.matchApplied));
  }

  page.drawText("This is a fictional statement generated for a product demo. It is not issued by any loan servicer.", {
    x: 56, y: 60, size: 8, font, color: rgb(0.4, 0.4, 0.4),
  });
  return doc.save({ useObjectStreams: false });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  for (const [id, x] of Object.entries(SAMPLE_EXTRACTIONS)) {
    const bytes = await render(id, x);
    writeFileSync(path.join(OUT, `${id}.pdf`), bytes);
    console.log(`wrote public/samples/${id}.pdf (${bytes.length} bytes)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

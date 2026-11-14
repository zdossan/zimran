import type { StatementExtraction } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

function Confidence({ value }: { value?: number }) {
  if (value === undefined) return null;
  if (value >= 0.8) return <Badge variant="outline">read clearly</Badge>;
  if (value >= 0.5) return <Badge variant="secondary">please check</Badge>;
  return <Badge variant="destructive">unsure</Badge>;
}

export function ExtractedFields({ x }: { x: StatementExtraction }) {
  const c = x.fieldConfidence;
  const rows: { label: string; value: string; key?: string }[] = [
    { label: "Servicer", value: x.servicer, key: "servicer" },
    { label: "Statement date", value: x.statementDate || "not shown", key: "statementDate" },
    { label: "Due date", value: x.dueDate, key: "dueDate" },
    { label: "Amount due", value: formatUSD(x.amountDue), key: "amountDue" },
    { label: "Principal balance", value: formatUSD(x.principalBalance), key: "principalBalance" },
    { label: "Repayment plan", value: x.planName ?? "not shown" },
  ];
  if (x.lastPayment) {
    rows.push({ label: "Last payment", value: `${formatUSD(x.lastPayment.amount)} on ${x.lastPayment.date || "unknown date"}`, key: "lastPayment" });
  }
  if (x.monthlyInterestAccrued !== undefined) {
    rows.push({ label: "Interest this month", value: formatUSD(x.monthlyInterestAccrued), key: "monthlyInterestAccrued" });
  }
  return (
    <dl className="grid gap-2 text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0">
          <dt className="text-muted-foreground">{r.label}</dt>
          <dd className="flex items-center gap-2 font-medium">
            {r.value}
            {r.key ? <Confidence value={c[r.key]} /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

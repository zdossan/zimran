"use client";
// Two small single-series bar charts (never one chart with two y-scales): monthly payment, and the
// 12-month balance change. Colours: blue = shrinks, red = grows (validated pair); text stays in ink tokens.
import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from "recharts";
import type { PlanId, PlanResult } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { PLAN_SHORT, signedUSD } from "@/components/funnel/labels";

const SHRINKS = "#2a78d6";
const GROWS = "#e34948";
const INK = "var(--muted-foreground)";
const whole = (n: number) => formatUSD(Math.round(n)).replace(".00", "");
const signedWhole = (n: number) => signedUSD(Math.round(n)).replace(".00", "");

const tooltipStyle = { fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" };

/** Value label just past each bar's data end: above a positive bar, below a negative one. */
function EndLabel(props: LabelProps) {
  const v = Number(props.value);
  const x = Number(props.x) + Number(props.width) / 2;
  const y = Number(props.y);
  const h = Number(props.height);
  const end = v >= 0 ? Math.min(y, y + h) : Math.max(y, y + h);
  return (
    <text x={x} y={v >= 0 ? end - 6 : end + 14} textAnchor="middle" fontSize={11} fill={INK}>
      {signedWhole(v)}
    </text>
  );
}

/** Leave room above and below the bars so end labels never hit the axis. */
const padded = ([min, max]: readonly number[]) => [Math.min(0, min) * 1.35, Math.max(0, max) * 1.35] as [number, number];

export function PaymentChart({ results, recommended }: { results: PlanResult[]; recommended: PlanId }) {
  const data = results
    .filter((r) => r.available)
    .map((r) => ({ name: PLAN_SHORT[r.plan], plan: r.plan, pay: r.monthlyPayment, change: r.balanceChange12m ?? 0 }));
  if (data.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <figure className="space-y-1">
        <figcaption className="text-sm font-medium">Monthly payment</figcaption>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 4, bottom: 0, left: 4 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "var(--border)" }} tick={{ fontSize: 12, fill: INK }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} formatter={(v) => [formatUSD(Number(v)), "Per month"]} />
              <Bar dataKey="pay" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false}>
                {data.map((d) => (
                  <Cell key={d.plan} fill={d.plan === recommended ? "var(--primary)" : "var(--chart-2)"} />
                ))}
                <LabelList dataKey="pay" position="top" formatter={(v) => whole(Number(v))} style={{ fontSize: 11, fill: INK }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">Darkest bar: the plan we recommend.</p>
      </figure>

      <figure className="space-y-1">
        <figcaption className="text-sm font-medium">Balance change over the next 12 months</figcaption>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: INK }} />
              <YAxis hide domain={padded} />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} formatter={(v) => [signedUSD(Number(v)), "This year"]} />
              <Bar dataKey="change" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false}>
                {data.map((d) => (
                  <Cell key={d.plan} fill={d.change > 0 ? GROWS : SHRINKS} />
                ))}
                <LabelList dataKey="change" content={EndLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">Red grows your balance, blue shrinks it.</p>
      </figure>
    </div>
  );
}

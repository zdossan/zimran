const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a dollar amount as "$1,234.56" (negative → "-$1,234.56"). */
export function formatUSD(n: number): string {
  return usd.format(n);
}

/** Round to cents, half-up — the project-wide money rounding rule. */
export function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

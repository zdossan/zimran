// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));
// Stand-in for P4's Paywall that always shows what it locks, plus the state it was given.
vi.mock("@/components/paywall/Paywall", () => ({
  Paywall: ({ feature, state, children }: { feature: string; state?: string; children: ReactNode }) => (
    <div data-testid="paywall" data-feature={feature} data-state={state ?? ""}>
      {children}
    </div>
  ),
}));

import { PaywallScreen } from "@/components/funnel/PaywallScreen";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import { SAMPLE_NOTE } from "@/components/funnel/samples";
import { DEMO_UNLOCK_KEY } from "@/lib/supabase/entitlement";
import { buildActionPlan, computePlans } from "@/lib/engine";

const save = (v: unknown) => window.localStorage.setItem("slg_session_borrowerInput", JSON.stringify(v));

beforeEach(() => {
  window.localStorage.clear();
});

describe("/paywall", () => {
  it("leads with what Owen Plus does for you, then compares Free and Plus, with a way back to the results", async () => {
    render(<PaywallScreen />);
    expect(await screen.findByRole("heading", { level: 1, name: "Stay on top of every loan deadline" })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Free vs Owen Plus" });
    const row = (name: RegExp) => within(table).getByRole("row", { name });
    expect(row(/Compare all 4 repayment plans/)).toHaveTextContent("Included");
    expect(within(row(/Calendar reminders/)).getAllByRole("cell")[1]).toHaveTextContent("Not included");
    expect(within(row(/Calendar reminders/)).getAllByRole("cell")[2]).toHaveTextContent("Included");
    expect(screen.getByText("We never ask for your FSA ID")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to my results" })).toHaveAttribute("href", "/results");
  });

  it("with saved answers, the action-plan paywall gets the borrower's state and locks their dated steps", async () => {
    save({ ...SAMPLE_BORROWERS.F2b, state: "NY" });
    render(<PaywallScreen />);
    const paywall = await screen.findByTestId("paywall");
    expect(paywall).toHaveAttribute("data-feature", "action-plan");
    expect(paywall).toHaveAttribute("data-state", "NY");
    const steps = buildActionPlan(computePlans(SAMPLE_BORROWERS.F2b), new Date());
    expect(within(paywall).getByText(new RegExp(steps[0].title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();
    expect(screen.getByTestId("plan-teaser")).toHaveTextContent(`Your plan has ${steps.length} steps`);
  });

  it("with no answers yet, still shows pricing and points to the free check", async () => {
    render(<PaywallScreen />);
    const paywall = await screen.findByTestId("paywall");
    expect(paywall).toHaveAttribute("data-state", "");
    expect(within(paywall).getByRole("link", { name: "Start the free check" })).toHaveAttribute("href", "/check");
  });

  it("once unlocked, the paid area is the plan hub: steps, calendar reminders and the monthly check-in", async () => {
    save(SAMPLE_BORROWERS.F2b);
    render(<PaywallScreen />);
    const paywall = await screen.findByTestId("paywall");
    expect(within(paywall).getByRole("button", { name: "Add all dates to my calendar" })).toBeInTheDocument();
    expect(within(paywall).getByRole("heading", { name: "Your monthly check-in" })).toBeInTheDocument();
    expect(within(paywall).getByTestId("step-apply-recommended")).toBeInTheDocument();
  });

  it("a paying user gets the plan full width, without the sales pitch", async () => {
    save(SAMPLE_BORROWERS.F2b);
    window.localStorage.setItem(DEMO_UNLOCK_KEY, "1"); // getEntitlement → pro (no Supabase in tests)
    render(<PaywallScreen />);
    expect(await screen.findByRole("heading", { name: "Your monthly check-in" })).toBeInTheDocument();
    expect(screen.queryByRole("table", { name: "Free vs Owen Plus" })).toBeNull();
    expect(screen.getByRole("link", { name: "Back to my results" })).toHaveAttribute("href", "/results");
  });

  it("the comparison lists what the plan hub really does", async () => {
    render(<PaywallScreen />);
    await screen.findByTestId("paywall");
    const table = screen.getByRole("table", { name: "Free vs Owen Plus" });
    for (const r of [/dated action plan/, /Calendar reminders/, /Ready-to-send letters/, /Monthly check-in/, /Owen report/, /Dispute tracker/, /My income changed/, /Pay extra or aim for forgiveness/, /Servicer call scripts/]) {
      expect(within(table).getByRole("row", { name: r })).toBeInTheDocument();
    }
  });

  it("offers 'Restore access' for people who paid on another phone or computer", async () => {
    render(<PaywallScreen />);
    expect(await screen.findByRole("button", { name: "Already subscribed? Restore access" })).toBeInTheDocument();
  });

  it("junk in storage is treated as no answers, not a crash", async () => {
    save({ agi: "x" });
    render(<PaywallScreen />);
    expect(await screen.findByTestId("paywall")).toHaveAttribute("data-state", "");
  });

  it("a non-text state in storage is treated as no answers, not a crash", async () => {
    save({ ...SAMPLE_BORROWERS.F2b, state: 5 });
    render(<PaywallScreen />);
    expect(await screen.findByTestId("paywall")).toHaveAttribute("data-state", "");
    expect(screen.getByRole("link", { name: "Run the free check first" })).toHaveAttribute("href", "/check");
  });

  it("a sample borrower's plan is labelled Sample, next to the steps teaser", async () => {
    save(SAMPLE_BORROWERS.F2b);
    window.localStorage.setItem("slg_funnel_notes", JSON.stringify([SAMPLE_NOTE]));
    render(<PaywallScreen />);
    const teaser = await screen.findByTestId("plan-teaser");
    expect(within(teaser).getByText("Sample")).toBeInTheDocument();
    expect(within(teaser).getByText(/these are not your numbers/)).toBeInTheDocument();
  });

  it("answers that give no plan: says so before the price, and points back to the check", async () => {
    save({ ...SAMPLE_BORROWERS.F1, loans: [] });
    render(<PaywallScreen />);
    await screen.findByTestId("paywall");
    expect(screen.getByText(/couldn't build a dated plan from your answers/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review your answers" })).toHaveAttribute("href", "/check");
  });
});

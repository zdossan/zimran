// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import { MOCK_COMPARISON, SAMPLE_BORROWERS } from "@/lib/mocks";
import { computePlans } from "@/lib/engine";
import { PlusTools } from "@/components/plan/PlusTools";
import { PlanHub } from "@/components/plan/PlanHub";
import { loadCalls, loadDisputes } from "@/components/plan/progress";

const NOW = new Date("2026-11-15T12:00:00Z");
const tools = (comparison = MOCK_COMPARISON) => render(<PlusTools comparison={comparison} now={NOW} />);
const tab = (name: string) => fireEvent.click(screen.getByRole("tab", { name }));
const money = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => window.localStorage.clear());

describe("PlusTools", () => {
  it("offers four tools as tabs, starting with disputes", () => {
    tools();
    const tabs = screen.getAllByRole("tab").map((t) => t.textContent);
    expect(tabs).toEqual(["Disputes", "Income changed?", "Pay extra?", "Call your servicer"]);
    expect(screen.getByRole("tab", { name: "Disputes" })).toHaveAttribute("aria-selected", "true");
  });

  it("disputes: add one, see when to follow up, mark it fixed and count the money back", () => {
    tools();
    fireEvent.click(screen.getByRole("button", { name: "Add a dispute" }));
    money("What's wrong", "Interest subsidy short by $40.10");
    money("Servicer", "MOHELA");
    money("Amount in question", "40.10");
    fireEvent.click(screen.getByRole("button", { name: "Start tracking" }));
    const card = within(screen.getByTestId(/^dispute-/));
    expect(card.getByText("Give MOHELA until Dec 15, 2026 to answer.")).toBeInTheDocument();
    fireEvent.click(card.getByRole("button", { name: "Mark fixed" }));
    money("Amount corrected", "40.10");
    fireEvent.click(card.getByRole("button", { name: "Save" }));
    expect(screen.getByTestId("recovered-total")).toHaveTextContent("$40.10");
    expect(loadDisputes()[0]).toMatchObject({ status: "fixed", recovered: 40.1 });
  });

  it("disputes: after 30 days, hands over the follow-up letter, then waits again once it's sent", () => {
    window.localStorage.setItem(
      "slg_disputes",
      JSON.stringify([{ id: "d1", title: "Interest subsidy short by $40.10", servicer: "MOHELA", amount: 40.1, sentOn: "2026-10-01", status: "sent" }]),
    );
    tools();
    const card = within(screen.getByTestId("dispute-d1"));
    fireEvent.click(card.getByRole("button", { name: "Get the follow-up letter" }));
    expect(card.getByText(/On October 1, 2026 I wrote to you/)).toBeInTheDocument();
    fireEvent.click(card.getByRole("button", { name: "I sent the follow-up" }));
    expect(card.getByText("Give MOHELA until Dec 15, 2026 to answer your follow-up.")).toBeInTheDocument();
  });

  it("income changed: a pay cut says recertify now, with the new payment", () => {
    tools();
    tab("Income changed?");
    money("Your new yearly income", "40,000");
    const result = screen.getByTestId("income-result");
    expect(result).toHaveTextContent("Recertify now");
    expect(result).toHaveTextContent("$129.17");
  });

  it("pay extra: shows when you'd be debt-free paying more, next to staying on the plan", () => {
    tools();
    tab("Pay extra?");
    money("Extra each month", "200");
    expect(screen.getByTestId("extra-result")).toHaveTextContent(/debt-free in/);
    expect(screen.getByTestId("stay-result")).toHaveTextContent(/forgiven/);
    expect(screen.getByText(/Rough estimate/)).toBeInTheDocument();
    expect(screen.getByTestId("extra-verdict")).toHaveTextContent(/Aiming for forgiveness costs about/);
  });

  it("pay extra on the PSLF track warns that it usually doesn't help", () => {
    tools(computePlans(SAMPLE_BORROWERS.F4));
    tab("Pay extra?");
    expect(screen.getByText(/120 qualifying payments/)).toBeInTheDocument();
  });

  it("call your servicer: shows the script for the problem and logs the call", () => {
    tools();
    tab("Call your servicer");
    fireEvent.click(screen.getByRole("radio", { name: "A billing error on my statement" }));
    expect(screen.getByText(/My statement dated \[DATE\] looks wrong/)).toBeInTheDocument();
    expect(screen.getByText(/Never give your FSA ID password/)).toBeInTheDocument();
    money("Who you spoke with", "Dana");
    money("Reference number", "REF-1");
    fireEvent.click(screen.getByRole("button", { name: "Log this call" }));
    expect(screen.getByText(/Dana · REF-1/)).toBeInTheDocument();
    expect(loadCalls()[0]).toMatchObject({ topic: "billing_error", rep: "Dana", reference: "REF-1" });
  });
});

describe("PlanHub", () => {
  it("includes the tools", () => {
    render(<PlanHub comparison={MOCK_COMPARISON} actions={[]} now={NOW} />);
    expect(screen.getByRole("heading", { name: "Your tools" })).toBeInTheDocument();
  });
});

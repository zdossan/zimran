// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import type { ActionItem } from "@/lib/types";
import { MOCK_COMPARISON, SAMPLE_BORROWERS } from "@/lib/mocks";
import { computePlans } from "@/lib/engine";
import { PlanHub } from "@/components/plan/PlanHub";

const NOW = new Date("2026-11-15T12:00:00Z");
const ACTIONS: ActionItem[] = [
  { id: "apply-recommended", dueDate: "2026-11-22", title: "Apply for RAP at StudentAid.gov or through your servicer (free)", detail: "Applying is free.", letterTemplateId: "plan_switch" },
  { id: "save-90-day", dueDate: "2026-11-30", title: "SAVE deadline: choose your new plan", detail: "Choose within 90 days." },
  { id: "no-new-loans", title: "Avoid new federal loans or consolidation", detail: "A new loan limits your options." },
];
const hub = (props: Partial<Parameters<typeof PlanHub>[0]> = {}) => render(<PlanHub comparison={MOCK_COMPARISON} actions={ACTIONS} now={NOW} {...props} />);

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("PlanHub: the steps", () => {
  it("lists every step with its date and how far away it is", () => {
    hub();
    const apply = within(screen.getByTestId("step-apply-recommended"));
    expect(apply.getByText("Nov 22, 2026 · in 7 days")).toBeInTheDocument();
    expect(within(screen.getByTestId("step-no-new-loans")).getByText("Any time")).toBeInTheDocument();
  });

  it("ticking a step done updates the progress and is remembered on this device", () => {
    const { unmount } = hub();
    expect(screen.getByText("0 of 3 done")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /Mark done: Apply for RAP/ }));
    expect(screen.getByText("1 of 3 done")).toBeInTheDocument();
    unmount();
    hub();
    expect(screen.getByRole("checkbox", { name: /Mark done: Apply for RAP/ })).toBeChecked();
    expect(screen.getByText("1 of 3 done")).toBeInTheDocument();
  });

  it("each step explains how to do it, with a link to the free official site", () => {
    hub();
    const apply = within(screen.getByTestId("step-apply-recommended"));
    expect(apply.getByText("How to do it")).toBeInTheDocument();
    expect(apply.getByRole("link", { name: "Open the application on StudentAid.gov" })).toHaveAttribute("href", "https://studentaid.gov/idr/");
  });

  it("a step that needs a letter hands over the letter, pre-filled, with a copy button", () => {
    hub();
    const apply = within(screen.getByTestId("step-apply-recommended"));
    fireEvent.click(apply.getByRole("button", { name: "Get the plan-switch letter" }));
    expect(apply.getByText(/Please place my loans on the Repayment Assistance Plan/)).toBeInTheDocument();
    expect(apply.getByRole("button", { name: "Copy letter" })).toBeInTheDocument();
  });

  it("'Add all dates to my calendar' downloads a calendar file", () => {
    const createObjectURL = vi.fn(() => "blob:plan");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    hub();
    fireEvent.click(screen.getByRole("button", { name: "Add all dates to my calendar" }));
    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("text/calendar");
    expect(click).toHaveBeenCalled();
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe("student-loan-guardian-plan.ics");
  });

  it("a sample borrower's plan is labelled Sample", () => {
    hub({ isSample: true });
    expect(within(screen.getByTestId("plan-hub")).getAllByText("Sample").length).toBeGreaterThan(0);
  });
});

describe("PlanHub: the monthly check-in", () => {
  it("with no statements checked yet, points to the statement check", () => {
    hub();
    expect(screen.getByText(/No statements checked yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Check a statement" })).toHaveAttribute("href", "/audit");
  });

  it("adds up the money found across statement checks", () => {
    window.localStorage.setItem(
      "slg_audit_history",
      JSON.stringify([
        { checkedOn: "2026-12-15", servicer: "MOHELA", errors: 1, warnings: 0, found: 40.1 },
        { checkedOn: "2026-11-15", servicer: "MOHELA", errors: 1, warnings: 1, found: 12.5 },
      ]),
    );
    hub();
    expect(screen.getByTestId("found-total")).toHaveTextContent("$52.60");
    expect(screen.getByText(/Dec 15, 2026 · MOHELA · 1 possible error/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get the CFPB complaint letter" })).toBeInTheDocument();
  });

  it("on a PSLF track, counts qualifying payments toward 120 and estimates when", () => {
    hub({ comparison: computePlans(SAMPLE_BORROWERS.F4) });
    const counter = within(screen.getByTestId("payment-counter"));
    expect(counter.getByText(/of 120/)).toBeInTheDocument();
    fireEvent.change(counter.getByLabelText("Qualifying payments so far"), { target: { value: "37" } });
    expect(counter.getByText(/83 payments to go/)).toHaveTextContent("around Oct 2033");
    expect(counter.getByText(/Under current rules/)).toBeInTheDocument();
  });

  it("off the PSLF track, counts toward the recommended plan's forgiveness (RAP: 30 years = 360 payments)", () => {
    hub();
    expect(within(screen.getByTestId("payment-counter")).getByText(/of 360/)).toBeInTheDocument();
  });
});

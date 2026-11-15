// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import { DashboardScreen } from "@/components/plan/DashboardScreen";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import { DEMO_UNLOCK_KEY } from "@/lib/supabase/entitlement";
import { SAMPLE_NOTE } from "@/components/funnel/samples";

const NOW = new Date("2026-11-15T12:00:00Z");
const save = (v: unknown) => window.localStorage.setItem("slg_session_borrowerInput", JSON.stringify(v));

beforeEach(() => window.localStorage.clear());

describe("/dashboard", () => {
  it("with no answers yet, sets up the dashboard from the free check", async () => {
    render(<DashboardScreen now={NOW} />);
    expect(await screen.findByRole("link", { name: "Run the free check" })).toHaveAttribute("href", "/check");
  });

  it("free: shows your balance, this month's payment and plan; the Plus tiles invite an upgrade", async () => {
    save(SAMPLE_BORROWERS.F2b);
    render(<DashboardScreen now={NOW} />);
    expect(await screen.findByRole("heading", { level: 1, name: "Your loan dashboard" })).toBeInTheDocument();
    expect(within(screen.getByTestId("tile-balance")).getByText("$40,000.00")).toBeInTheDocument();
    expect(within(screen.getByTestId("tile-payment")).getByText("$129.17")).toBeInTheDocument();
    expect(within(screen.getByTestId("tile-payment")).getByText(/Estimate on the Repayment Assistance Plan/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Check this month's statement" })).toHaveAttribute("href", "/audit");
    expect(within(screen.getByTestId("tile-deadline")).getByRole("link", { name: /Unlock with Owen Plus/ })).toHaveAttribute("href", "/paywall");
  });

  it("Owen Plus: the next deadline, money recovered and progress are live", async () => {
    save(SAMPLE_BORROWERS.F2b);
    window.localStorage.setItem(DEMO_UNLOCK_KEY, "1");
    window.localStorage.setItem("slg_disputes", JSON.stringify([{ id: "a", title: "x", sentOn: "2026-10-01", status: "fixed", recovered: 40.1 }]));
    render(<DashboardScreen now={NOW} />);
    const deadline = await screen.findByTestId("tile-deadline");
    expect(await within(deadline).findByText(/Apply for RAP/)).toBeInTheDocument();
    expect(within(screen.getByTestId("tile-recovered")).getByText("$40.10")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Unlock with Owen Plus/ })).toBeNull();
  });

  it("a sample borrower's dashboard is labelled Sample", async () => {
    save(SAMPLE_BORROWERS.F2b);
    window.localStorage.setItem("slg_funnel_notes", JSON.stringify([SAMPLE_NOTE]));
    render(<DashboardScreen now={NOW} />);
    expect(await screen.findByText("Sample")).toBeInTheDocument();
  });
});

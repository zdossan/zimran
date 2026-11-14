// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { Quiz } from "@/components/funnel/Quiz";
import { SampleButtons } from "@/components/funnel/SampleButtons";
import { loadSessionData } from "@/lib/supabase/session";
import { loadFunnelNotes } from "@/components/funnel/notesStore";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import type { BorrowerInput } from "@/lib/types";

const next = () => fireEvent.click(screen.getByRole("button", { name: /^(next|see my plans)$/i }));
const type = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const choose = (name: string | RegExp) => fireEvent.click(screen.getByRole("radio", { name }));

beforeEach(() => {
  push.mockReset();
  window.localStorage.clear();
});

describe("Quiz", () => {
  it("blocks Next on a blank income and says why", () => {
    render(<Quiz />);
    next();
    expect(screen.getByRole("alert")).toHaveTextContent(/income/i);
    expect(screen.getByRole("heading", { name: "Your income" })).toBeInTheDocument();
  });

  it("walks all six steps, saves the answers and opens the results", async () => {
    render(<Quiz />);
    type(/income/i, "$55,000");
    next();
    choose("Head of household");
    next();
    fireEvent.click(screen.getByRole("button", { name: "Add a dependent" }));
    fireEvent.click(screen.getByRole("button", { name: "Add a dependent" }));
    fireEvent.change(screen.getByLabelText(/state/i), { target: { value: "OH" } });
    next();
    type(/total federal loan balance/i, "40,000");
    type(/interest rate/i, "6.5");
    fireEvent.change(screen.getByLabelText(/first federal loan/i), { target: { value: "2012" } });
    choose("Not sure");
    next();
    choose(/Private company/);
    next();
    fireEvent.change(screen.getByLabelText(/current plan/i), { target: { value: "SAVE" } });
    next();

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/results"));
    const saved = await loadSessionData<BorrowerInput>("borrowerInput");
    expect(saved).toMatchObject({ agi: 55000, filingStatus: "hoh", dependents: 2, familySize: 3, state: "OH", currentPlan: "SAVE", hadBalanceOnJuly2014: true });
    expect(loadFunnelNotes()).toHaveLength(1);
  });

  it("skips the July 2014 question when the first loan is 2015 or later", () => {
    render(<Quiz />);
    type(/income/i, "55000");
    next();
    choose("Single");
    next();
    fireEvent.change(screen.getByLabelText(/state/i), { target: { value: "OH" } });
    next();
    fireEvent.change(screen.getByLabelText(/first federal loan/i), { target: { value: "2012" } });
    expect(screen.getByText(/July 1, 2014/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/first federal loan/i), { target: { value: "2018" } });
    expect(screen.queryByText(/July 1, 2014/)).toBeNull();
  });

  it("asks for the spouse's income when filing jointly", () => {
    render(<Quiz />);
    type(/income/i, "60000");
    next();
    choose("Married, filing jointly");
    next();
    expect(screen.getByRole("alert")).toHaveTextContent(/spouse/i);
  });
});

describe("SampleButtons", () => {
  it("loads the single-parent sample and opens the results", async () => {
    render(<SampleButtons />);
    fireEvent.click(screen.getByRole("button", { name: "Try: single parent, 2 kids" }));
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/results"));
    expect(await loadSessionData("borrowerInput")).toEqual(SAMPLE_BORROWERS.F2b);
    expect(loadFunnelNotes()[0]).toMatch(/Sample borrower — these are not your numbers/);
  });
});

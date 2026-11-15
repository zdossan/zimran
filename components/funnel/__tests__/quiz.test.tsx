// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import CheckPage from "@/app/check/page";
import { Quiz } from "@/components/funnel/Quiz";
import { SampleButtons } from "@/components/funnel/SampleButtons";
import { SAMPLE_NOTE } from "@/components/funnel/samples";
import { loadSessionData } from "@/lib/supabase/session";
import { loadFunnelNotes } from "@/components/funnel/notesStore";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import type { BorrowerInput } from "@/lib/types";

const next = () => fireEvent.click(screen.getByRole("button", { name: /^(continue|see my plans)$/i }));
const type = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const choose = (name: string | RegExp) => fireEvent.click(screen.getByRole("radio", { name }));

beforeEach(() => {
  push.mockReset();
  window.localStorage.clear();
});

describe("Quiz", () => {
  it("blocks Continue on a blank income and says why", () => {
    render(<Quiz />);
    next();
    expect(screen.getByRole("alert")).toHaveTextContent(/income/i);
    expect(screen.getByRole("heading", { name: "What was your income last year?" })).toBeInTheDocument();
  });

  it("shows the step, a progress bar and a way back home", () => {
    render(<Quiz />);
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Quiz progress" })).toHaveAttribute("aria-valuenow", "1");
    type(/income/i, "55000");
    next();
    expect(screen.getByText("Step 2 of 6")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Quiz progress" })).toHaveAttribute("aria-valuenow", "2");
  });

  it("each new step's question gets fresh focus and scrolls into view, even if the old heading still had focus (iOS Safari)", () => {
    const scrolled = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrolled;
    render(<Quiz />);
    type(/income/i, "55000");
    const old = screen.getByRole("heading", { name: "What was your income last year?" });
    old.focus();
    next();
    const fresh = screen.getByRole("heading", { name: "How do you file your taxes?" });
    expect(fresh).toHaveFocus();
    expect(fresh).not.toBe(old);
    expect(scrolled.mock.contexts).toContain(fresh);
  });

  it("shows the error inside the action bar, which sticks (not fixed) so it releases before the footer", () => {
    render(<Quiz />);
    next();
    const bar = screen.getByTestId("quiz-actions");
    expect(bar).toContainElement(screen.getByRole("alert"));
    expect(bar.className).toMatch(/\bsticky\b/);
    expect(bar.className).not.toMatch(/\bfixed\b/);
  });

  it("the action bar is just the two buttons: no background strip, border or blur behind them", () => {
    render(<Quiz />);
    const bar = screen.getByTestId("quiz-actions");
    expect(bar.className).not.toMatch(/\bbg-|\bborder-t\b|backdrop-blur/);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("choice cards are visible native radios with a solid focus ring", () => {
    render(<Quiz />);
    type(/income/i, "55000");
    next();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    for (const r of radios) {
      expect(r).toHaveAttribute("type", "radio");
      expect(r).not.toHaveClass("sr-only");
    }
    const card = radios[0].closest("label")!;
    expect(card.className).toContain("has-[:focus-visible]:ring-primary");
    expect(card.className).not.toMatch(/focus-visible\]:ring-primary\/\d+/);
  });

  it("answer chips jump back to their step with the answer kept", () => {
    render(<Quiz />);
    type(/income/i, "$55,000");
    next();
    choose("Head of household");
    next();
    fireEvent.click(screen.getByRole("button", { name: "Edit income: $55,000" }));
    expect(screen.getByRole("heading", { name: "What was your income last year?" })).toBeInTheDocument();
    expect(screen.getByLabelText(/income/i)).toHaveValue("$55,000");
    next();
    expect(screen.getByRole("button", { name: "Edit income: $55,000" })).toBeInTheDocument();
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
    expect(loadFunnelNotes()).not.toContain(SAMPLE_NOTE);
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

describe("Quiz fits one screen", () => {
  it("sample borrowers are offered on the first step only, so later steps stay short", () => {
    render(<Quiz />);
    expect(screen.getByRole("button", { name: "Try: single parent, 2 kids" })).toBeInTheDocument();
    type(/income/i, "55000");
    next();
    expect(screen.queryByRole("button", { name: "Try: single parent, 2 kids" })).toBeNull();
  });

  it("answer chips sit in one scrollable row instead of wrapping onto many lines", () => {
    render(<Quiz />);
    type(/income/i, "55000");
    next();
    choose("Single");
    next();
    const chips = screen.getByRole("list", { name: "Your answers so far" });
    expect(chips.className).toMatch(/\boverflow-x-auto\b/);
    expect(chips.className).not.toMatch(/\bflex-wrap\b/);
  });
});

describe("Quiz with a sample borrower", () => {
  const sampleButton = (name: string) => screen.getByRole("button", { name });

  it("loading a sample pre-fills every step; finishing it untouched carries the Sample note", async () => {
    render(<Quiz />);
    fireEvent.click(sampleButton("Try: single parent, 2 kids"));
    expect(sampleButton("Try: single parent, 2 kids")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText(/income/i)).toHaveValue("55,000");
    for (let i = 0; i < 6; i++) next();
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/results"));
    expect(await loadSessionData("borrowerInput")).toMatchObject({ agi: 55000, filingStatus: "hoh", dependents: 2, state: "OH", currentPlan: "SAVE" });
    expect(loadFunnelNotes()).toContain(SAMPLE_NOTE);
  });

  it("editing any answer turns the sample off, so the results are not labelled Sample", async () => {
    render(<Quiz initialSample="F2b" />);
    expect(sampleButton("Try: single parent, 2 kids")).toHaveAttribute("aria-pressed", "true");
    type(/income/i, "48,000");
    expect(sampleButton("Try: single parent, 2 kids")).toHaveAttribute("aria-pressed", "false");
    for (let i = 0; i < 6; i++) next();
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/results"));
    expect(await loadSessionData("borrowerInput")).toMatchObject({ agi: 48000 });
    expect(loadFunnelNotes()).not.toContain(SAMPLE_NOTE);
  });

  it("/check?sample=F4 opens the quiz pre-filled with the married teacher", async () => {
    render(await CheckPage({ searchParams: Promise.resolve({ sample: "F4" }) }));
    expect(screen.getByLabelText(/income/i)).toHaveValue("60,000");
    expect(sampleButton("Try: married teacher")).toHaveAttribute("aria-pressed", "true");
  });

  it("an unknown ?sample= value opens an empty quiz", async () => {
    render(await CheckPage({ searchParams: Promise.resolve({ sample: "<script>" }) }));
    expect(screen.getByLabelText(/income/i)).toHaveValue("");
    expect(sampleButton("Try: married teacher")).toHaveAttribute("aria-pressed", "false");
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

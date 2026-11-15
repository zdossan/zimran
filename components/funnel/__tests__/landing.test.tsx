// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import Home from "@/app/page";
import { computePlans } from "@/lib/engine";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import { loadSessionData } from "@/lib/supabase/session";
import { loadFunnelNotes } from "@/components/funnel/notesStore";
import { PLAN_FULL_NAME, wholeUSD } from "@/components/funnel/labels";

beforeEach(() => {
  push.mockReset();
  window.localStorage.clear();
});

describe("landing page", () => {
  it("leads with the SAVE headline and a no-login promise", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your SAVE plan is ending. See your cheapest legal plan in 60 seconds. No login.");
    expect(screen.getByText("Then let us check your servicer's statements for errors.")).toBeInTheDocument();
  });

  it("the primary button starts the check", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Start the free check" })).toHaveAttribute("href", "/check");
  });

  it("the first screen is the promise and the button: no legal box in the hero (owner's call, 2026-11-15)", () => {
    const { container } = render(<Home />);
    expect(container.querySelector('[data-variant="hero"]')).toBeNull();
    expect(screen.queryByText("Before you start")).toBeNull();
    const cta = screen.getByRole("link", { name: "Start the free check" });
    const samples = screen.getByRole("heading", { name: "See it with a sample borrower" });
    expect(cta.compareDocumentPosition(samples) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("the single-parent card shows the engine's answer, labelled Sample, and offers the quiz or the results", async () => {
    render(<Home />);
    const card = within(screen.getByTestId("sample-card-F2b"));
    expect(card.getByText("Sample")).toBeInTheDocument();
    expect(card.getByText("Repayment Assistance Plan")).toBeInTheDocument();
    expect(card.getByTestId("sample-payment")).toHaveTextContent("$129/mo");
    expect(card.getByText(/Estimate · Rules as of Nov 1, 2026/)).toBeInTheDocument();
    expect(card.getByText("$40,000 at 6.5%")).toBeInTheDocument();
    expect(card.getByRole("link", { name: "Walk through it in the quiz" })).toHaveAttribute("href", "/check?sample=F2b");
    fireEvent.click(card.getByRole("button", { name: "See their results" }));
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/results"));
    expect(await loadSessionData("borrowerInput")).toEqual(SAMPLE_BORROWERS.F2b);
    expect(loadFunnelNotes()[0]).toMatch(/Sample borrower — these are not your numbers/);
  });

  it("the married-teacher card shows what the engine recommends for that sample (never a hard-coded plan)", () => {
    render(<Home />);
    const c = computePlans(SAMPLE_BORROWERS.F4);
    const rec = c.results.find((r) => r.plan === c.recommended)!;
    const card = within(screen.getByTestId("sample-card-F4"));
    expect(card.getByText(PLAN_FULL_NAME[rec.plan])).toBeInTheDocument();
    expect(card.getByTestId("sample-payment")).toHaveTextContent(`${wholeUSD(rec.monthlyPayment)}/mo`);
    expect(card.getByRole("link", { name: "Walk through it in the quiz" })).toHaveAttribute("href", "/check?sample=F4");
  });

  it("shows the two Reddit quotes verbatim, attributed to r/StudentLoans", () => {
    render(<Home />);
    expect(screen.getByText(/SAVE was 497 new IDR plan is 2157 a month\. Trying to figure out if I should sell my house/)).toBeInTheDocument();
    expect(screen.getByText(/My interest subsidy should be 93\.21\/month\. I received \$53\.11\./)).toBeInTheDocument();
    expect(screen.getAllByText("— r/StudentLoans, 2026")).toHaveLength(2);
  });

  it("stat tiles are honest and consistent with the 60-second headline", () => {
    render(<Home />);
    for (const t of ["4 plans compared", "6 questions · no login", "0 passwords asked"]) expect(screen.getByText(t)).toBeInTheDocument();
    expect(screen.queryByText(/2 minutes/)).toBeNull();
  });

  it("the preview card shows the sample borrower's real engine result, labelled Sample", () => {
    render(<Home />);
    const card = within(screen.getByTestId("preview-card"));
    expect(card.getByText("Sample")).toBeInTheDocument();
    expect(card.getByText("$129")).toBeInTheDocument();
    expect(card.getByText("↓ $600 this year")).toBeInTheDocument();
    expect(card.getByText(/Rules as of Nov 1, 2026/)).toBeInTheDocument();
  });

  it("ends with a call to start the check", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Start the 60-second check" })).toHaveAttribute("href", "/check");
  });

  it("the headline is two-tone: the promise in our indigo", () => {
    render(<Home />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.querySelector(".text-brand-700")).toHaveTextContent("See your cheapest legal plan in 60 seconds.");
  });

  it("shows the sample result inside a product window, labelled Sample", () => {
    render(<Home />);
    const card = screen.getByTestId("preview-card");
    expect(card.closest("[data-window]")).not.toBeNull();
  });

  it("answers the questions people ask, with honest answers", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "Questions borrowers ask us" })).toBeInTheDocument();
    for (const q of ["Is Owen free?", "Do you need my FSA ID?", "Is Owen part of the government?", "How does Owen make money?"]) {
      expect(screen.getByText(q)).toBeInTheDocument();
    }
    const faq = within(screen.getByRole("region", { name: "Questions borrowers ask us" }));
    expect(faq.getByText(/never ask for your FSA ID/)).toBeInTheDocument();
    expect(faq.getByText(/not affiliated with the U.S. Department of Education/)).toBeInTheDocument();
  });

  it("each landing section is its own screen-sized page", () => {
    const { container } = render(<Home />);
    const pages = [...container.querySelectorAll("[data-page]")].map((e) => e.getAttribute("data-page"));
    expect(pages).toEqual(["hero", "samples", "how", "quotes", "faq", "cta"]);
  });

  it("on phones the sample borrowers are a swipeable row, one card per screen width", () => {
    render(<Home />);
    const row = screen.getByRole("list", { name: "Sample borrowers" });
    expect(row.querySelectorAll(":scope > li")).toHaveLength(2);
    expect(row.className).toMatch(/\bsnap-x\b/);
    expect(row.className).toMatch(/\boverflow-x-auto\b/);
  });

  it("the hero has one main button; the sample is a light text link", () => {
    render(<Home />);
    const sample = screen.getByRole("link", { name: /See a sample borrower/ });
    expect(sample).toHaveAttribute("href", "/#samples");
    expect(sample.className).not.toMatch(/\brounded-full\b/);
  });

  it("'How it works' is one card with three steps, not three separate cards", () => {
    render(<Home />);
    const steps = screen.getByRole("list", { name: "Three steps" });
    expect(within(steps).getAllByRole("listitem")).toHaveLength(3);
  });

  it("never uses banned phrases", () => {
    const { container } = render(<Home />);
    const text = container.textContent!.toLowerCase();
    for (const banned of ["forgiveness guaranteed", "get your loans forgiven", "stop collections", "fsa id password"]) {
      expect(text).not.toContain(banned);
    }
  });
});

// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import Home from "@/app/page";

describe("landing page", () => {
  it("leads with the SAVE headline and a no-login promise", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your SAVE plan is ending. See your cheapest legal plan in 60 seconds. No login.");
    expect(screen.getByText("Then let us check your servicer's statements for errors.")).toBeInTheDocument();
  });

  it("the primary button starts the check, with sample borrowers beside it", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Start the free check" })).toHaveAttribute("href", "/check");
    expect(screen.getByRole("button", { name: "Try: married teacher" })).toBeInTheDocument();
  });

  it("puts the hero disclaimer directly under the buttons, before 'How it works'", () => {
    const { container } = render(<Home />);
    const cta = screen.getByRole("link", { name: "Start the free check" });
    const disclaimer = container.querySelector('[data-variant="hero"]')!;
    const how = screen.getByRole("heading", { name: "How it works" });
    expect(cta.compareDocumentPosition(disclaimer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(disclaimer.compareDocumentPosition(how) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
  });

  it("never uses banned phrases", () => {
    const { container } = render(<Home />);
    const text = container.textContent!.toLowerCase();
    for (const banned of ["forgiveness guaranteed", "get your loans forgiven", "stop collections", "fsa id password"]) {
      expect(text).not.toContain(banned);
    }
  });
});

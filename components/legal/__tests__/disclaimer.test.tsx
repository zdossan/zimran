// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Disclaimer } from "@/components/legal/Disclaimer";

// Key-phrase table from the task brief (Step 1). Each variant must render its own exact text
// from components/legal/texts.ts — not a shared placeholder.
const CASES: Array<{ variant: Parameters<typeof Disclaimer>[0]["variant"]; phrase: string }> = [
  { variant: "footer", phrase: "independent company" },
  { variant: "hero", phrase: "may not be the best or only option" },
  { variant: "results", phrase: "These are estimates, not guarantees" },
  { variant: "letter", phrase: "Template only" },
];

describe("Disclaimer", () => {
  for (const { variant, phrase } of CASES) {
    it(`variant="${variant}" renders its key phrase`, () => {
      render(<Disclaimer variant={variant} />);
      expect(screen.getByText(new RegExp(phrase))).toBeInTheDocument();
    });
  }

  it('variant="paywall" renders both "What you\'re buying" and "Manage subscription"', () => {
    render(<Disclaimer variant="paywall" />);
    expect(screen.getByText(/What you're buying/)).toBeInTheDocument();
    expect(screen.getByText(/Manage subscription/)).toBeInTheDocument();
  });

  it('variant="audit" renders "flag *possible* discrepancies" ignoring markdown asterisks', () => {
    render(<Disclaimer variant="audit" />);
    // The text matcher's first argument is already scoped to this element's own direct text
    // (RTL's getNodeText), so stripping asterisks here only normalizes this node, not ancestors.
    const node = screen.getByText((content) => content.replace(/\*/g, "").includes("flag possible discrepancies"));
    expect(node).toBeInTheDocument();
  });

  it("hero variant is rendered at >=12pt (16px) and bold (NY §703: 12-point bold)", () => {
    render(<Disclaimer variant="hero" />);
    const node = screen.getByText(/may not be the best or only option/);
    const style = getComputedStyle(node);
    expect(parseFloat(style.fontSize)).toBeGreaterThanOrEqual(16);
    expect(["bold", "700", "800", "900"]).toContain(style.fontWeight);
  });

  it("footer variant keeps rendering for the site footer (app/layout.tsx)", () => {
    render(<Disclaimer variant="footer" />);
    expect(screen.getByText(/independent company/)).toBeInTheDocument();
  });
});

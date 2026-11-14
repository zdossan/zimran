// @vitest-environment jsdom
// Guards the shared Vitest setup: DOM cleanup between tests + jest-dom matchers (used by P2/P4 component tests).
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Disclaimer } from "@/components/legal/Disclaimer";

describe("component test setup", () => {
  it("renders the footer disclaimer (first render)", () => {
    render(<Disclaimer variant="footer" />);
    expect(screen.getByText(/independent company/)).toBeInTheDocument();
  });

  it("renders it again without leftovers from the previous test", () => {
    render(<Disclaimer variant="hero" />);
    expect(screen.getByText(/independent company/)).toBeInTheDocument();
  });
});

// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

const { pathname } = vi.hoisted(() => ({ pathname: { current: "/" } }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { SiteHeader } from "@/components/brand/SiteHeader";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { Badge, buttonClass, Card, Eyebrow, SampleTag } from "@/components/brand/kit";

beforeEach(() => {
  pathname.current = "/";
});

describe("SiteHeader", () => {
  it("floats as pills: the logo, the navigation and the call to action each in their own rounded pill", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Owen" }).closest("[data-pill]")).not.toBeNull();
    expect(screen.getByRole("navigation", { name: "Main" }).getAttribute("data-pill")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Start the 60-second check" }).className).toMatch(/\brounded-full\b/);
  });

  it("links to how it works, the statement check and pricing, plus the main CTA", () => {
    render(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "How it works" })).toHaveAttribute("href", "/#how-it-works");
    expect(within(nav).getByRole("link", { name: "Statement check" })).toHaveAttribute("href", "/audit");
    expect(within(nav).getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/paywall");
    expect(screen.getByRole("link", { name: "Start the 60-second check" })).toHaveAttribute("href", "/check");
    expect(screen.getByRole("link", { name: "Owen" })).toHaveAttribute("href", "/");
  });

  it("hides the nav and the CTA inside the quiz, keeping only the brand", () => {
    pathname.current = "/check";
    render(<SiteHeader />);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByRole("link", { name: "Start the 60-second check" })).toBeNull();
    expect(screen.getByRole("link", { name: "Owen" })).toBeInTheDocument();
  });

  it("the phone menu button reports its state and reveals the mobile nav", () => {
    render(<SiteHeader />);
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull();
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    const mobile = screen.getByRole("navigation", { name: "Mobile" });
    fireEvent.click(within(mobile).getByRole("link", { name: "Pricing" }));
    expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull();
  });
});

describe("SiteHeader menu", () => {
  it("closes when the page changes (brand link, back button) and on Escape", () => {
    const { rerender } = render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();
    pathname.current = "/audit";
    rerender(<SiteHeader />);
    expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("button", { name: "Close menu" }), { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull();
    expect(screen.getByRole("button", { name: "Open menu" })).not.toHaveAttribute("aria-controls");
  });

  it("stays closed when coming back to the page it was opened on (back button)", () => {
    const { rerender } = render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    pathname.current = "/audit";
    rerender(<SiteHeader />);
    pathname.current = "/";
    rerender(<SiteHeader />);
    expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull();
  });
});

describe("SiteFooter", () => {
  it("is hidden inside the quiz, so each step is one screen with nothing to scroll to", () => {
    pathname.current = "/check";
    const { container } = render(<SiteFooter />);
    expect(container.querySelector("footer")).toBeNull();
  });

  it("shows the brand, links and the rules date, without the long disclaimer paragraph (owner's call, 2026-11-15)", () => {
    const { container } = render(<SiteFooter />);
    expect(container.querySelector('[data-variant="footer"]')).toBeNull();
    expect(screen.getByRole("link", { name: "Owen" })).toHaveAttribute("href", "/");
    expect(screen.getByText(/Rules as of Nov 1, 2026/)).toBeInTheDocument();
  });
});

describe("kit", () => {
  it("buttons are at least 44px tall", () => {
    for (const v of ["primary", "secondary", "ghost"] as const) expect(buttonClass(v)).toMatch(/\bmin-h-11\b/);
  });

  it("buttons are fully rounded pills, medium weight (not bold)", () => {
    for (const v of ["primary", "secondary", "ghost"] as const) {
      expect(buttonClass(v)).toMatch(/\brounded-full\b/);
      expect(buttonClass(v)).not.toMatch(/\bfont-bold\b/);
    }
  });

  it("cards are soft: very rounded with a diffuse shadow instead of a hard border", () => {
    render(<Card data-testid="c">x</Card>);
    const c = screen.getByTestId("c");
    expect(c.className).toMatch(/rounded-\[28px\]/);
    expect(c.className).not.toMatch(/\bborder\b/);
  });

  it("an eyebrow label introduces a section", () => {
    render(<Eyebrow>FAQ</Eyebrow>);
    expect(screen.getByText("FAQ")).toHaveClass("uppercase");
  });

  it("sample data is labelled Sample", () => {
    render(<SampleTag />);
    expect(screen.getByText("Sample")).toBeInTheDocument();
  });

  it("badges render their text", () => {
    render(<Badge tone="success">Save 27%</Badge>);
    expect(screen.getByText("Save 27%")).toBeInTheDocument();
  });
});

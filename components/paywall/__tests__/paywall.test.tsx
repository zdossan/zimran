// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { isPaidStateBlocked } from "@/lib/supabase/entitlement";

// getEntitlement is mocked per-test so Paywall's rendering logic can be tested without a real
// Supabase project or localStorage fallback.
vi.mock("@/lib/supabase/entitlement", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/entitlement")>(
    "@/lib/supabase/entitlement"
  );
  return {
    ...actual,
    getEntitlement: vi.fn(),
  };
});

import { getEntitlement } from "@/lib/supabase/entitlement";
import { Paywall } from "@/components/paywall/Paywall";

describe("isPaidStateBlocked", () => {
  it("blocks NY and CA (case-insensitive)", () => {
    expect(isPaidStateBlocked("NY")).toBe(true);
    expect(isPaidStateBlocked("ca")).toBe(true);
  });

  it("does not block TX", () => {
    expect(isPaidStateBlocked("TX")).toBe(false);
  });
});

describe("Paywall", () => {
  beforeEach(() => {
    vi.mocked(getEntitlement).mockReset();
  });

  it("renders children when the user is entitled", async () => {
    vi.mocked(getEntitlement).mockResolvedValue({ pro: true, paidStateBlocked: false });

    render(
      <Paywall feature="letters">
        <div>secret letters content</div>
      </Paywall>
    );

    expect(await screen.findByText("secret letters content")).toBeInTheDocument();
  });

  it("shows a disabled checkout button until the acknowledgment checkbox is checked", async () => {
    vi.mocked(getEntitlement).mockResolvedValue({ pro: false, paidStateBlocked: false });

    render(
      <Paywall feature="report">
        <div>secret report content</div>
      </Paywall>
    );

    const button = await screen.findByRole("button", { name: /continue to secure checkout/i });
    expect(button).toBeDisabled();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(button).not.toBeDisabled();
    expect(screen.queryByText("secret report content")).not.toBeInTheDocument();
  });

  it("lets the plan choices wrap, so 'Annual — $79/yr (save 27%)' never runs off the card on a 390px phone", async () => {
    vi.mocked(getEntitlement).mockResolvedValue({ pro: false, paidStateBlocked: false });

    render(
      <Paywall feature="action-plan">
        <div>plan</div>
      </Paywall>
    );

    const picker = await screen.findByRole("radiogroup", { name: "Choose a plan" });
    expect(picker.className).toMatch(/\bflex-wrap\b/);
  });

  it("shows both prices up front and says exactly what will be charged for the chosen plan", async () => {
    vi.mocked(getEntitlement).mockResolvedValue({ pro: false, paidStateBlocked: false });

    render(
      <Paywall feature="action-plan">
        <div>plan</div>
      </Paywall>
    );

    expect(await screen.findByRole("radio", { name: /Monthly/ })).toHaveTextContent("$9");
    expect(screen.getByRole("radio", { name: /Annual/ })).toHaveTextContent("$79");
    expect(screen.getByText("Tick the box above to continue.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByText("You'll be charged $9 today, then every month until you cancel.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Annual/ }));
    expect(screen.getByRole("radio", { name: /Annual/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("You'll be charged $79 today, then every year until you cancel.")).toBeInTheDocument();
  });

  it("shows the chosen price large, with the annual plan's monthly equivalent and a secure-checkout note", async () => {
    vi.mocked(getEntitlement).mockResolvedValue({ pro: false, paidStateBlocked: false });
    render(
      <Paywall feature="action-plan">
        <div>plan</div>
      </Paywall>
    );
    expect(await screen.findByTestId("price")).toHaveTextContent("$9/month");
    fireEvent.click(screen.getByRole("radio", { name: /Annual/ }));
    expect(screen.getByTestId("price")).toHaveTextContent("$79/year");
    expect(screen.getByText("That's $6.58 a month.")).toBeInTheDocument();
    expect(screen.getByText(/Secure checkout by Stripe/)).toBeInTheDocument();
  });

  it("puts the price before the fine print, and keeps the fine print visible (never collapsed)", async () => {
    vi.mocked(getEntitlement).mockResolvedValue({ pro: false, paidStateBlocked: false });
    const { container } = render(
      <Paywall feature="action-plan">
        <div>plan</div>
      </Paywall>
    );
    const price = await screen.findByTestId("price");
    const fine = container.querySelector('[data-variant="paywall"]')!;
    expect(price.compareDocumentPosition(fine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(fine.closest("details")).toBeNull();
  });

  it("shows the block message instead of plan choices when the state is blocked", async () => {
    vi.mocked(getEntitlement).mockResolvedValue({ pro: false, paidStateBlocked: true });

    render(
      <Paywall feature="action-plan" state="NY">
        <div>secret plan content</div>
      </Paywall>
    );

    expect(
      await screen.findByText("Paid plans aren't available in your state yet. You can use our free tools.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue to secure checkout/i })).not.toBeInTheDocument();
  });
});

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

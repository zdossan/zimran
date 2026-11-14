// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Entitlement } from "@/lib/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));
// Stand-in for P4's Paywall that exposes the state it was given.
vi.mock("@/components/paywall/Paywall", () => ({
  Paywall: ({ feature, state, children }: { feature: string; state?: string; children: ReactNode }) => (
    <div data-feature={feature} data-state={state ?? ""}>
      {children}
    </div>
  ),
}));
const { getEntitlement } = vi.hoisted(() => ({ getEntitlement: vi.fn<(state?: string) => Promise<Entitlement>>() }));
vi.mock("@/lib/supabase/entitlement", async (orig) => ({ ...(await orig<typeof import("@/lib/supabase/entitlement")>()), getEntitlement }));

import { ResultsView } from "@/components/funnel/ResultsView";
import { MOCK_COMPARISON } from "@/lib/mocks";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

beforeEach(() => {
  getEntitlement.mockReset();
  getEntitlement.mockImplementation(async (state) => ({ pro: false, paidStateBlocked: state === "NY" || state === "CA" }));
});

const withState = (state: string) => ({ ...MOCK_COMPARISON, input: { ...MOCK_COMPARISON.input, state } });

describe("action-plan CTA", () => {
  it("in New York: no price on the button, and the revealed paywall gets the state for its block message", async () => {
    const { container } = render(<ResultsView comparison={withState("NY")} onChange={() => undefined} />);
    const cta = await screen.findByRole("button", { name: "Get my dated action plan" });
    expect(cta).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(cta);
    expect(cta).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector('[data-feature="action-plan"]')).toHaveAttribute("data-state", "NY");
  });

  it("a paying user sees the dated plan open, with no price button", async () => {
    getEntitlement.mockImplementation(async () => ({ pro: true, plan: "monthly", paidStateBlocked: false }));
    render(<ResultsView comparison={withState("OH")} onChange={() => undefined} />);
    expect(await screen.findByRole("heading", { name: "Your dated action plan" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /from \$9\/mo/ })).toBeNull();
  });

  it("closing keeps the paywall mounted (hidden) so its checkbox state survives, and aria-controls points at it", async () => {
    const { container } = render(<ResultsView comparison={withState("OH")} onChange={() => undefined} />);
    const cta = await screen.findByRole("button", { name: "Get my dated action plan · from $9/mo" });
    const panel = container.querySelector(`#${cta.getAttribute("aria-controls")}`);
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("hidden");
    fireEvent.click(cta);
    expect(panel).not.toHaveAttribute("hidden");
    fireEvent.click(cta);
    expect(panel).toHaveAttribute("hidden");
    expect(container.querySelector('[data-feature="action-plan"]')).not.toBeNull();
  });
});

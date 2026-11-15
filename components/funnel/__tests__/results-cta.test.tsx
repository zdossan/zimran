// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { Entitlement } from "@/lib/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));
const { getEntitlement } = vi.hoisted(() => ({ getEntitlement: vi.fn<(state?: string) => Promise<Entitlement>>() }));
vi.mock("@/lib/supabase/entitlement", async (orig) => ({ ...(await orig<typeof import("@/lib/supabase/entitlement")>()), getEntitlement }));

import { ResultsView } from "@/components/funnel/ResultsView";
import { MOCK_COMPARISON } from "@/lib/mocks";

beforeEach(() => {
  getEntitlement.mockReset();
  getEntitlement.mockImplementation(async (state) => ({ pro: false, paidStateBlocked: state === "NY" || state === "CA" }));
});

const withState = (state: string) => ({ ...MOCK_COMPARISON, input: { ...MOCK_COMPARISON.input, state } });

describe("action-plan CTA", () => {
  it("shows the starting price next to the button", async () => {
    render(<ResultsView comparison={withState("OH")} onChange={() => undefined} />);
    expect(await screen.findByRole("link", { name: "Get my dated action plan" })).toHaveAttribute("href", "/paywall");
    expect(within(screen.getByTestId("recommendation")).getByText(/From \$9\/mo/)).toBeInTheDocument();
  });

  it("in New York: still links to the paywall page (which explains the block), with no price", async () => {
    render(<ResultsView comparison={withState("NY")} onChange={() => undefined} />);
    expect(await screen.findByRole("link", { name: "Get my dated action plan" })).toHaveAttribute("href", "/paywall");
    expect(within(screen.getByTestId("recommendation")).queryByText(/\$9/)).toBeNull();
  });

  it("a paying user opens the plan directly, with no price", async () => {
    getEntitlement.mockImplementation(async () => ({ pro: true, plan: "monthly", paidStateBlocked: false }));
    render(<ResultsView comparison={withState("OH")} onChange={() => undefined} />);
    expect(await screen.findByRole("link", { name: "Open my dated action plan" })).toHaveAttribute("href", "/paywall");
    expect(within(screen.getByTestId("recommendation")).queryByText(/\$9/)).toBeNull();
  });
});

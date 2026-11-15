// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));
vi.mock("@/lib/supabase/client", () => ({ getBrowserClient: () => null }));

import { CheckoutSuccessClient } from "@/app/checkout/success/CheckoutSuccessClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("checkout success", () => {
  it("after a confirmed payment, the main button opens what they bought: the dated action plan", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ pro: true }), { status: 200 })));
    render(<CheckoutSuccessClient sessionId="cs_test_123" />);
    expect(await screen.findByRole("link", { name: "See my dated action plan" })).toHaveAttribute("href", "/paywall");
    expect(screen.getByRole("link", { name: "Back to results" })).toHaveAttribute("href", "/results");
    expect(screen.getByRole("button", { name: "Manage subscription" })).toBeInTheDocument();
  });

  it("tells payers how to unlock another device with the email they paid with", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ pro: true }), { status: 200 })));
    render(<CheckoutSuccessClient sessionId="cs_test_123" />);
    expect(await screen.findByText(/On another phone or computer\?/)).toHaveTextContent(/Restore access/);
  });

  it("an unconfirmed payment unlocks nothing and offers no plan link", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "session_not_confirmed" }), { status: 403 })));
    render(<CheckoutSuccessClient sessionId="cs_test_123" />);
    expect(await screen.findByText(/couldn't confirm your payment/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "See my dated action plan" })).toBeNull();
  });
});

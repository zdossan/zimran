// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CheckoutCancelPage from "@/app/checkout/cancel/page";

// Review Focus (plans/04-pay-trust-pitch.md): "The user closes Stripe or presses Back: nothing
// is unlocked, and the page shows 'Payment cancelled — nothing was charged.'"
describe("CheckoutCancelPage", () => {
  it('renders "Payment cancelled — nothing was charged."', () => {
    render(<CheckoutCancelPage />);
    expect(screen.getByText("Payment cancelled — nothing was charged.")).toBeInTheDocument();
  });
});

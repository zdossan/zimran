import { describe, it, expect, beforeEach, vi } from "vitest";

// Hoisted so the module factories below (vi.mock calls are hoisted by Vitest to the top of the
// file) can close over the same mock instances the tests configure in beforeEach/it blocks.
const { authGetUser, entitlementsBuilder, stripeMocks } = vi.hoisted(() => {
  const authGetUser = vi.fn();

  const entitlementsBuilder = {
    upsert: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  entitlementsBuilder.select.mockReturnValue(entitlementsBuilder);
  entitlementsBuilder.eq.mockReturnValue(entitlementsBuilder);

  const stripeMocks = {
    checkoutSessionsCreate: vi.fn(),
    checkoutSessionsRetrieve: vi.fn(),
    billingPortalSessionsCreate: vi.fn(),
  };

  return { authGetUser, entitlementsBuilder, stripeMocks };
});

// Fakes the service-role Supabase client (lib/supabase/server.ts) used by every route handler
// to resolve the bearer token into a user id, and (for confirm) to upsert entitlements.
vi.mock("@/lib/supabase/server", () => ({
  getServiceClient: () => ({
    auth: { getUser: authGetUser },
    from: () => entitlementsBuilder,
  }),
}));

// Per the brief: vi.mock("stripe") so no real network call is ever attempted. `getStripe()`
// does `new Stripe(secretKey)`, so the mocked default export must be `new`-able — a plain arrow
// function fails with "not a constructor".
vi.mock("stripe", () => ({
  default: vi.fn(function MockStripe() {
    return {
      checkout: {
        sessions: {
          create: stripeMocks.checkoutSessionsCreate,
          retrieve: stripeMocks.checkoutSessionsRetrieve,
        },
      },
      billingPortal: {
        sessions: { create: stripeMocks.billingPortalSessionsCreate },
      },
    };
  }),
}));

import { POST as checkoutPost } from "@/app/api/checkout/route";
import { POST as confirmPost } from "@/app/api/checkout/confirm/route";

function checkoutReq(body: unknown, token: string | null = "valid-token") {
  return new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function confirmReq(body: unknown, token: string | null = "valid-token") {
  return new Request("http://localhost/api/checkout/confirm", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout and /api/checkout/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PRICE_MONTHLY = "price_monthly_123";
    process.env.STRIPE_PRICE_ANNUAL = "price_annual_123";
    authGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    entitlementsBuilder.upsert.mockResolvedValue({ error: null });
    entitlementsBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it("checkout with state: NY returns 403 state_blocked", async () => {
    const res = await checkoutPost(checkoutReq({ plan: "monthly", state: "NY" }));

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: "state_blocked" });
    expect(stripeMocks.checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("checkout with no STRIPE_SECRET_KEY returns { configured: false }", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const res = await checkoutPost(checkoutReq({ plan: "monthly", state: "OH" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ configured: false });
    expect(stripeMocks.checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("checkout creates a subscription session and returns its url for an allowed state", async () => {
    stripeMocks.checkoutSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test_1" });

    const res = await checkoutPost(checkoutReq({ plan: "annual", state: "OH" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ url: "https://checkout.stripe.com/pay/cs_test_1" });
    expect(stripeMocks.checkoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [{ price: "price_annual_123", quantity: 1 }],
        client_reference_id: "user-1",
        success_url: "http://localhost/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost/checkout/cancel",
      }),
    );
  });

  it("confirm with a mocked session whose client_reference_id differs from the user returns 403", async () => {
    stripeMocks.checkoutSessionsRetrieve.mockResolvedValue({
      id: "cs_test_mismatch",
      status: "complete",
      client_reference_id: "some-other-user",
      customer: "cus_123",
      metadata: { plan: "monthly" },
    });

    const res = await confirmPost(confirmReq({ session_id: "cs_test_mismatch" }));

    expect(res.status).toBe(403);
    expect(entitlementsBuilder.upsert).not.toHaveBeenCalled();
  });

  it("calling confirm twice with the same session_id upserts idempotently on stripe_session_id and returns { pro: true } both times", async () => {
    stripeMocks.checkoutSessionsRetrieve.mockResolvedValue({
      id: "cs_test_twice",
      status: "complete",
      client_reference_id: "user-1",
      customer: "cus_456",
      metadata: { plan: "annual" },
    });

    const res1 = await confirmPost(confirmReq({ session_id: "cs_test_twice" }));
    await expect(res1.json()).resolves.toEqual({ pro: true });

    const res2 = await confirmPost(confirmReq({ session_id: "cs_test_twice" }));
    await expect(res2.json()).resolves.toEqual({ pro: true });

    expect(entitlementsBuilder.upsert).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = entitlementsBuilder.upsert.mock.calls;
    expect(firstCall[0]).toMatchObject({ user_id: "user-1", pro: true, plan: "annual", stripe_session_id: "cs_test_twice" });
    expect(secondCall[0]).toMatchObject({ user_id: "user-1", pro: true, plan: "annual", stripe_session_id: "cs_test_twice" });
    expect(firstCall[1]).toEqual({ onConflict: "stripe_session_id" });
    expect(secondCall[1]).toEqual({ onConflict: "stripe_session_id" });
  });
});

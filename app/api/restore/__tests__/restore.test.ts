import { describe, it, expect, beforeEach, vi } from "vitest";

const { auth, entitlements, stripe } = vi.hoisted(() => ({
  auth: { getUser: vi.fn(), signInWithOtp: vi.fn() },
  entitlements: { upsert: vi.fn() },
  stripe: { customersList: vi.fn(), subscriptionsList: vi.fn() },
}));

vi.mock("@/lib/supabase/server", () => ({
  getServiceClient: () => ({ auth, from: () => entitlements }),
}));

vi.mock("stripe", () => ({
  default: vi.fn(function MockStripe() {
    return {
      customers: { list: stripe.customersList },
      subscriptions: { list: stripe.subscriptionsList },
    };
  }),
}));

import { POST as start } from "@/app/api/restore/start/route";
import { POST as finish } from "@/app/api/restore/finish/route";

const json = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/restore", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });

const subscriber = (status: string, price = "price_annual") => {
  stripe.customersList.mockResolvedValue({ data: [{ id: "cus_1" }] });
  stripe.subscriptionsList.mockResolvedValue({ data: [{ status, items: { data: [{ price: { id: price } }] } }] });
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
  process.env.STRIPE_PRICE_ANNUAL = "price_annual";
  process.env.STRIPE_PRICE_MONTHLY = "price_monthly";
  auth.signInWithOtp.mockResolvedValue({ error: null });
  entitlements.upsert.mockResolvedValue({ error: null });
  stripe.customersList.mockResolvedValue({ data: [] });
  stripe.subscriptionsList.mockResolvedValue({ data: [] });
});

describe("POST /api/restore/start", () => {
  it("rejects something that isn't an email", async () => {
    const res = await start(json({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("an active subscriber gets a 6-digit code emailed (via Supabase)", async () => {
    subscriber("active");
    const res = await start(json({ email: "  Payer@Example.com " }));
    expect(await res.json()).toEqual({ ok: true });
    expect(stripe.customersList).toHaveBeenCalledWith(expect.objectContaining({ email: "payer@example.com" }));
    expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: "payer@example.com", options: { shouldCreateUser: true } });
  });

  it("someone with no subscription gets the same answer, and no email is sent (no way to learn who paid)", async () => {
    const res = await start(json({ email: "stranger@example.com" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("a cancelled subscription doesn't get a code", async () => {
    subscriber("canceled");
    await start(json({ email: "payer@example.com" }));
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("without Stripe configured, says restore isn't available instead of crashing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(await (await start(json({ email: "payer@example.com" }))).json()).toEqual({ configured: false });
  });
});

describe("POST /api/restore/finish", () => {
  const bearer = { authorization: "Bearer tok" };

  it("without a signed-in session: 401", async () => {
    expect((await finish(json({}))).status).toBe(401);
  });

  it("a session whose email isn't verified can't restore", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: "u2", email: "payer@example.com", email_confirmed_at: null } }, error: null });
    subscriber("active");
    expect((await finish(json({}, bearer))).status).toBe(403);
    expect(entitlements.upsert).not.toHaveBeenCalled();
  });

  it("a verified email with an active subscription unlocks this device's user", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: "u2", email: "Payer@example.com", email_confirmed_at: "2026-11-15T10:00:00Z" } }, error: null });
    subscriber("active", "price_annual");
    const res = await finish(json({}, bearer));
    expect(await res.json()).toEqual({ pro: true });
    expect(entitlements.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u2", pro: true, plan: "annual", stripe_customer_id: "cus_1" }),
      { onConflict: "user_id" },
    );
  });

  it("a verified email with no active subscription: 403, nothing unlocked", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: "u2", email: "payer@example.com", email_confirmed_at: "2026-11-15T10:00:00Z" } }, error: null });
    subscriber("canceled");
    const res = await finish(json({}, bearer));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "no_active_subscription" });
    expect(entitlements.upsert).not.toHaveBeenCalled();
  });
});

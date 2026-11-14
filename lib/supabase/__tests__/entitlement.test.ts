import { describe, it, expect, beforeEach, vi } from "vitest";

// Fake Supabase client: records which query-builder methods getEntitlement calls on the
// `entitlements` table. The migration only grants `select` to `authenticated` on that table —
// this test is the trust-critical guarantee that client code never attempts a write against it
// (all writes are server-side-only, Task 3's job).
const { builder, calls, state } = vi.hoisted(() => {
  const calls: string[] = [];
  const state: { selectResult: { data: unknown; error: unknown }; userId: string | null } = {
    selectResult: { data: null, error: null },
    userId: "user-123",
  };
  const builder: Record<string, (...args: unknown[]) => unknown> = {};
  builder.select = () => {
    calls.push("select");
    return builder;
  };
  builder.eq = () => {
    calls.push("eq");
    return builder;
  };
  builder.maybeSingle = async () => {
    calls.push("maybeSingle");
    return state.selectResult;
  };
  builder.single = async () => {
    calls.push("single");
    return state.selectResult;
  };
  builder.insert = () => {
    calls.push("insert");
    return builder;
  };
  builder.update = () => {
    calls.push("update");
    return builder;
  };
  builder.upsert = () => {
    calls.push("upsert");
    return builder;
  };
  return { builder, calls, state };
});

vi.mock("@/lib/supabase/client", () => ({
  getBrowserClient: () => ({ from: () => builder }),
  ensureAnonSession: async () => state.userId,
}));

import { getEntitlement } from "@/lib/supabase/entitlement";

describe("getEntitlement RLS safety (faked-in-the-browser entitlement)", () => {
  beforeEach(() => {
    calls.length = 0;
    state.userId = "user-123";
    state.selectResult = { data: { pro: true, plan: "monthly" }, error: null };
  });

  it("only ever calls select-family methods against entitlements, never insert/update/upsert", async () => {
    const result = await getEntitlement("TX");

    expect(result.pro).toBe(true);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls).not.toContain("insert");
    expect(calls).not.toContain("update");
    expect(calls).not.toContain("upsert");
    expect(calls.some((c) => c === "select" || c === "maybeSingle" || c === "single")).toBe(true);
  });

  it("still never writes when no row is found (not entitled)", async () => {
    state.selectResult = { data: null, error: null };

    const result = await getEntitlement("TX");

    expect(result.pro).toBe(false);
    expect(calls).not.toContain("insert");
    expect(calls).not.toContain("update");
    expect(calls).not.toContain("upsert");
  });
});

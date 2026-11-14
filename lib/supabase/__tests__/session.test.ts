// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { getBrowserClient } from "@/lib/supabase/client";
import { saveSessionData, loadSessionData } from "@/lib/supabase/session";
import { SAMPLE_BORROWERS } from "@/lib/mocks";

describe("session persistence (no Supabase env vars set)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("getBrowserClient returns null when env vars are missing", () => {
    expect(getBrowserClient()).toBeNull();
  });

  it("round-trips borrowerInput through localStorage", async () => {
    await saveSessionData("borrowerInput", SAMPLE_BORROWERS.F2b);
    const loaded = await loadSessionData("borrowerInput");
    expect(loaded).toEqual(SAMPLE_BORROWERS.F2b);
  });

  it("returns null for a key that was never saved", async () => {
    const loaded = await loadSessionData("comparison");
    expect(loaded).toBeNull();
  });
});

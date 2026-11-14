import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/audit/rules", () => ({
  auditStatement: () => {
    throw new Error("rules bug");
  },
}));

import { POST } from "@/app/api/audit/route";

describe("POST /api/audit when the checks themselves fail", () => {
  it("reports a checking failure as its own error (not 'reading unavailable') and logs it", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await POST(
      new Request("http://localhost/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sampleId: "mohela-subsidy-error" }) }),
    );
    expect(res.status).toBe(500);
    expect((await res.json()).error).not.toBe("Statement reading is unavailable right now");
    expect(JSON.stringify(log.mock.calls)).toContain("rules bug");
    log.mockRestore();
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/audit/route";

const json = (body: unknown) =>
  new Request("http://localhost/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

describe("POST /api/audit", () => {
  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("audits a bundled sample from cached data when no API key is set", async () => {
    const res = await POST(json({ sampleId: "mohela-subsidy-error" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.usedCache).toBe(true);
    expect(body.result.rulesAsOf).toBe("2026-11-01");
    const f = body.result.findings.find((x: { id: string }) => x.id === "rap-subsidy");
    expect(f.severity).toBe("error");
    expect(f.expected).toBe(93.21);
    expect(f.actual).toBe(53.11);
  });

  it("rejects an unknown sample id", async () => {
    const res = await POST(json({ sampleId: "nope" }));
    expect(res.status).toBe(400);
  });

  it("rejects a file type other than PDF, PNG or JPEG", async () => {
    const form = new FormData();
    form.set("file", new File(["hello"], "notes.txt", { type: "text/plain" }));
    const res = await POST(new Request("http://localhost/api/audit", { method: "POST", body: form }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("PDF, PNG or JPEG");
  });

  it("rejects a file over 4 MB (the hosting platform's request limit)", async () => {
    const form = new FormData();
    form.set("file", new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.pdf", { type: "application/pdf" }));
    const res = await POST(new Request("http://localhost/api/audit", { method: "POST", body: form }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("4 MB");
  });

  it("answers a malformed upload with a JSON error instead of crashing", async () => {
    const res = await POST(
      new Request("http://localhost/api/audit", { method: "POST", headers: { "content-type": "multipart/form-data; boundary=x" }, body: "not multipart" }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeTruthy();
  });

  it("ignores borrower answers that aren't valid JSON", async () => {
    const form = new FormData();
    form.set("file", new File([new Uint8Array([1, 2, 3])], "bill.png", { type: "image/png" }));
    form.set("input", "{not json");
    const res = await POST(new Request("http://localhost/api/audit", { method: "POST", body: form }));
    expect(res.status).toBe(503);
  });

  it("explains when a real upload can't be read right now", async () => {
    const form = new FormData();
    form.set("file", new File([new Uint8Array([1, 2, 3])], "bill.png", { type: "image/png" }));
    const res = await POST(new Request("http://localhost/api/audit", { method: "POST", body: form }));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("Statement reading is unavailable right now");
  });
});

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import { LLM_OK } from "./fixtures";

const { parse } = vi.hoisted(() => ({ parse: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    beta = { messages: { parse } };
  },
}));

import { extractStatement, MODEL } from "@/lib/audit/extract";

const apiError = () => Object.assign(new Error("400 fallbacks not supported with output_config"), { name: "BadRequestError", status: 400 });

describe("statement extraction through the Claude API (SDK mocked)", () => {
  let log: MockInstance;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    parse.mockReset();
    log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    log.mockRestore();
  });

  it("sends the statement to the model with structured output and server-side fallbacks", async () => {
    parse.mockResolvedValue({ stop_reason: "end_turn", parsed_output: LLM_OK });
    const r = await extractStatement({ base64: "SECRETDOC", mediaType: "application/pdf" });
    expect(r.usedCache).toBe(false);
    expect(r.extraction.amountDue).toBe(87.79);
    const req = parse.mock.calls[0][0];
    expect(req.model).toBe(MODEL);
    expect(req.fallbacks).toBe("default");
    expect(req.betas).toContain("server-side-fallback-2026-07-01");
    expect(req.output_config.format).toBeDefined();
    expect(req.messages[0].content[0]).toMatchObject({ type: "document", source: { media_type: "application/pdf", data: "SECRETDOC" } });
  });

  it("logs why a live sample read failed, then uses the cached sample", async () => {
    parse.mockRejectedValue(apiError());
    const r = await extractStatement({ sampleId: "mohela-subsidy-error" });
    expect(r.usedCache).toBe(true);
    expect(JSON.stringify(log.mock.calls)).toContain("fallbacks not supported");
  });

  it("logs why an upload read failed, without logging the document", async () => {
    parse.mockRejectedValue(apiError());
    await expect(extractStatement({ base64: "SECRETDOC", mediaType: "image/png" })).rejects.toThrow("Statement reading is unavailable right now");
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain("BadRequestError");
    expect(logged).not.toContain("SECRETDOC");
  });

  it("treats a refusal as unavailable", async () => {
    parse.mockResolvedValue({ stop_reason: "refusal", parsed_output: null });
    await expect(extractStatement({ base64: "AAAA", mediaType: "image/jpeg" })).rejects.toThrow("Statement reading is unavailable right now");
  });
});

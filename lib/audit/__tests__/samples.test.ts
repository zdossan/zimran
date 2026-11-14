import { describe, it, expect } from "vitest";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { SAMPLE_IDS } from "@/lib/audit";

describe("bundled sample statements", () => {
  for (const id of SAMPLE_IDS) {
    it(`${id}.pdf exists, is a PDF, is labelled SAMPLE and is small`, () => {
      const file = path.join(process.cwd(), "public", "samples", `${id}.pdf`);
      const bytes = readFileSync(file);
      expect(bytes.subarray(0, 4).toString("latin1")).toBe("%PDF");
      expect(statSync(file).size).toBeLessThan(500 * 1024);
      // Titles are written uncompressed into the PDF info dictionary.
      expect(bytes.toString("latin1")).toContain("SAMPLE - NOT A REAL STATEMENT");
    });
  }
});

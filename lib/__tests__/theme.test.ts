import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const css = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

describe("layout (app/layout.tsx)", () => {
  const layout = readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf8");

  it("the size container is a wrapper div, not <body> — portals and fixed elements escape it (older Safari)", () => {
    expect(layout).not.toMatch(/<body[^>]*@container/);
    expect(layout).toMatch(/<div className="@container/);
  });
});

describe("theme (app/globals.css)", () => {
  it("the sans font no longer points at itself (which fell back to Times New Roman)", () => {
    expect(css).not.toMatch(/--font-sans:\s*var\(--font-sans\)/);
    expect(css).toMatch(/--font-sans:\s*var\(--font-manrope\)/);
  });

  it("uses the indigo primary and the soft lavender-grey page background", () => {
    expect(css).toMatch(/--primary:\s*#4840BB/i);
    expect(css).toMatch(/--background:\s*#F5F6FB/i);
  });
});

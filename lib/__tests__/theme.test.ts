import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const css = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

describe("layout (app/layout.tsx)", () => {
  const layout = readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf8");

  it("renders the site header and footer around the page", () => {
    expect(layout).toMatch(/<SiteHeader\s*\/>/);
    expect(layout).toMatch(/<SiteFooter\s*\/>/);
  });

  it("main has no width cap — each page owns its container, so full-bleed sections can span the screen", () => {
    const main = layout.match(/<main[^>]*>/)?.[0] ?? "";
    expect(main).not.toBe("");
    expect(main).not.toMatch(/max-w-/);
  });
});

describe("theme (app/globals.css)", () => {
  it("the sans font is Poppins (rette.ai-style type), never pointing at itself (which fell back to Times New Roman)", () => {
    expect(css).not.toMatch(/--font-sans:\s*var\(--font-sans\)/);
    expect(css).toMatch(/--font-sans:\s*var\(--font-poppins\)/);
  });

  it("our indigo is the brand scale, defined once in the theme", () => {
    expect(css).toMatch(/--color-brand-700:\s*#4840BB/i);
    expect(css).toMatch(/--color-brand-900:\s*#2A2475/i);
  });

  it("components use the brand scale, never a hard-coded palette, so the colours change in one place", () => {
    const files = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? (e.name === "__tests__" ? [] : files(path.join(dir, e.name))) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : [],
      );
    const offenders = [...files(path.join(process.cwd(), "components")), ...files(path.join(process.cwd(), "app"))].filter((f) =>
      /\bteal-\d|#FBFAF7/i.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("keyboard focus is a solid 2px ring everywhere (the 50%-alpha default was ~2:1 on paper)", () => {
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--ring\)/);
  });

  it("the focus default lives in @layer base, so outline-none / own-ring utilities still win (no box on the quiz heading)", () => {
    expect(css).toMatch(/@layer base\s*\{\s*:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--ring\)/);
  });

  it("uses our indigo primary on the soft lavender-grey background", () => {
    expect(css).toMatch(/--primary:\s*#4840BB/i);
    expect(css).toMatch(/--background:\s*#F5F6FB/i);
  });
});

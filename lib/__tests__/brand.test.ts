import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";

// next/font only runs inside Next's compiler; the layout's metadata is all this test reads.
vi.mock("next/font/google", () => ({ Poppins: () => ({ variable: "font-poppins" }), Geist_Mono: () => ({ variable: "font-mono" }) }));

import { DISCLAIMERS } from "@/components/legal/texts";
import manifest from "@/app/manifest";
import { metadata } from "@/app/layout";

const root = process.cwd();
const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name === "__tests__" ? [] : sources(path.join(dir, e.name))) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : [],
  );

describe("brand: Owen", () => {
  it("the old name is gone from every page, legal text, letter, report and calendar file", () => {
    const offenders = ["app", "components", "lib"]
      .flatMap((d) => sources(path.join(root, d)))
      .filter((f) => /Student Loan Guardian|Guardian report/.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(root, f));
    expect(offenders).toEqual([]);
  });

  it("the legal texts carry the new name with their wording unchanged", () => {
    expect(DISCLAIMERS.footer.startsWith("Owen is an independent company. We are not affiliated with, endorsed by, or acting for the U.S. Department of Education")).toBe(true);
    expect(DISCLAIMERS.hero.startsWith("What we do: Owen is software.")).toBe(true);
  });

  it("the browser tab says what Owen is", () => {
    expect(metadata.title).toBe("Owen — your student loan guardian");
  });

  it("ships the favicon, icon, Apple icon and app icons from the brand pack", () => {
    for (const f of ["app/favicon.ico", "app/icon.svg", "app/apple-icon.png", "public/icon-192.png", "public/icon-512.png", "public/brand/logo.svg", "public/brand/logo-on-dark.svg"]) {
      expect(existsSync(path.join(root, f)), f).toBe(true);
    }
    expect(readFileSync(path.join(root, "app/icon.svg"), "utf8")).toContain("#4840BB");
  });

  it("the web app manifest names Owen and lists the 192 and 512 icons", () => {
    const m = manifest();
    expect(m.name).toBe("Owen — your student loan guardian");
    expect(m.short_name).toBe("Owen");
    expect(m.icons?.map((i) => i.sizes)).toEqual(["192x192", "512x512"]);
  });
});

// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Band, GlassChip, GRADIENT } from "@/components/brand/Band";

describe("Band", () => {
  it("wraps its content in the indigo gradient band", () => {
    render(
      <Band>
        <p>hi</p>
      </Band>,
    );
    const band = screen.getByText("hi").closest("[data-band]") as HTMLElement;
    expect(band).not.toBeNull();
    expect(band.style.background).toContain("radial-gradient");
  });

  it("spans the body's width in container units, not 100vw (which includes the desktop scrollbar)", () => {
    render(
      <Band>
        <p>wide</p>
      </Band>,
    );
    const band = screen.getByText("wide").closest("[data-band]") as HTMLElement;
    expect(band.style.width).toBe("100cqw");
    expect(band.className).not.toMatch(/w-screen|50vw/);
  });

  it("the gradient runs through the brand indigo", () => {
    expect(GRADIENT).toContain("#4840BB");
  });

  it("glass chips render their text on a dark translucent fill (white-on-white-glass fails contrast near the glow)", () => {
    render(<GlassChip>↓ $600 this year</GlassChip>);
    const chip = screen.getByText("↓ $600 this year");
    expect(chip.className).toContain("bg-[#14142B]/25");
    expect(chip.className).not.toContain("bg-white/15");
  });
});

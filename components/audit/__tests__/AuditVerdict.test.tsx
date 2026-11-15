// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditVerdict, verdictFor } from "@/components/audit/AuditVerdict";
import { auditStatement } from "@/lib/audit";
import { SAMPLE_EXTRACTIONS } from "@/lib/audit/samples";
import type { AuditFinding } from "@/lib/types";

const warn = (id: string): AuditFinding => ({ id, severity: "warn", title: "Check this", detail: "", ruleRef: "x" });

describe("verdictFor", () => {
  it("leads with the possible error and its title", () => {
    expect(verdictFor(auditStatement(SAMPLE_EXTRACTIONS["mohela-subsidy-error"]))).toEqual({
      headline: "1 possible error",
      detail: "Your RAP interest subsidy looks short by $40.10",
    });
  });

  it("a clean statement adds up", () => {
    expect(verdictFor(auditStatement(SAMPLE_EXTRACTIONS["edfinancial-ok"])).headline).toBe("Everything we checked adds up");
  });

  it("only warnings: leads with the count and the first warning, never 'nothing wrong'", () => {
    expect(verdictFor([warn("a")])).toEqual({ headline: "1 thing to check", detail: "Check this" });
    expect(verdictFor([warn("a"), warn("b")]).headline).toBe("2 things to check");
  });

  it("when nothing could be checked, says so", () => {
    const noData = (id: string): AuditFinding => ({ ...warn(id), title: `Not enough data on this statement to check ${id}` });
    expect(verdictFor([noData("a"), noData("b")])).toEqual({
      headline: "We couldn't check this statement fully",
      detail: "2 checks need numbers this statement doesn't show.",
    });
  });
});

describe("AuditVerdict", () => {
  it("shows the headline as a heading with the detail beneath", () => {
    render(<AuditVerdict findings={auditStatement(SAMPLE_EXTRACTIONS["mohela-subsidy-error"])} />);
    expect(screen.getByRole("heading", { name: "1 possible error" })).toBeInTheDocument();
    expect(screen.getByText("Your RAP interest subsidy looks short by $40.10")).toBeInTheDocument();
  });

  it("the card's tone follows the answer: error, check, or all clear — never green when something is off", () => {
    const tone = (findings: AuditFinding[]) => {
      const { container, unmount } = render(<AuditVerdict findings={findings} />);
      const t = container.querySelector("[data-tone]")!.getAttribute("data-tone");
      unmount();
      return t;
    };
    expect(tone(auditStatement(SAMPLE_EXTRACTIONS["mohela-subsidy-error"]))).toBe("error");
    expect(tone([warn("a")])).toBe("warn");
    expect(tone(auditStatement(SAMPLE_EXTRACTIONS["edfinancial-ok"]))).toBe("ok");
  });
});

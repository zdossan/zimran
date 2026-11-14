// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// The real Paywall is P4's stub and hides its children; render them so the paid parts can be exercised.
vi.mock("@/components/paywall/Paywall", () => ({
  Paywall: ({ feature, state, children }: { feature: string; state?: string; children: ReactNode }) => (
    <div data-testid={`paywall-${feature}`} data-state={state ?? ""}>
      {children}
    </div>
  ),
}));

import { AuditView } from "@/components/audit/AuditView";
import { FindingsList } from "@/components/audit/FindingsList";
import { auditStatement } from "@/lib/audit";
import { SAMPLE_EXTRACTIONS } from "@/lib/audit/samples";
import { RULES_AS_OF } from "@/lib/types";

const mohela = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
const auditBody = { result: { extraction: mohela, findings: auditStatement(mohela), rulesAsOf: RULES_AS_OF }, usedCache: true };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AuditView", () => {
  it("labels the upload control and says where the file goes", () => {
    render(<AuditView />);
    expect(screen.getByLabelText(/upload your statement/i)).toHaveAttribute("type", "file");
    expect(screen.getByText(/Anthropic/)).toBeInTheDocument();
  });

  it("gives each sample button its own accessible name", () => {
    render(<AuditView />);
    expect(screen.getByRole("button", { name: "Check the MOHELA statement sample" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View the MOHELA statement sample PDF" })).toBeInTheDocument();
  });

  it("rejects a file over 4 MB before uploading it", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<AuditView />);
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText(/upload your statement/i), { target: { files: [big] } });
    expect(screen.getByText(/over 4 MB/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tells the user when the report can't be built", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(auditBody), { status: 200, headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response("nope", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<AuditView />);
    fireEvent.click(screen.getByRole("button", { name: "Check the MOHELA statement sample" }));
    fireEvent.click(await screen.findByRole("button", { name: /Download Guardian report/ }));
    expect(await screen.findByText(/couldn't build your report/i)).toBeInTheDocument();
  });

  it("leads the results with the verdict", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(auditBody), { status: 200, headers: { "content-type": "application/json" } })),
    );
    render(<AuditView />);
    fireEvent.click(screen.getByRole("button", { name: "Check the MOHELA statement sample" }));
    const verdict = await screen.findByRole("heading", { name: "1 possible error" });
    expect(verdict).toHaveFocus(); // moved there so phones land on the answer
    expect(screen.getByText(/Sample statement — not real data/i)).toHaveClass("text-[#C81E4F]");
  });
});

describe("FindingsList", () => {
  it("passes the borrower's state to the letters paywall so the NY/CA block can show", async () => {
    render(<FindingsList findings={auditStatement(mohela)} state="NY" servicer="MOHELA (SAMPLE)" />);
    fireEvent.click(screen.getAllByRole("button", { name: "Draft letter" })[0]);
    expect(await screen.findByTestId("paywall-letters")).toHaveAttribute("data-state", "NY");
  });
});

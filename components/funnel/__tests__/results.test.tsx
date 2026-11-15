// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import { ResultsView } from "@/components/funnel/ResultsView";
import { ResultsScreen } from "@/components/funnel/ResultsScreen";
import { SAMPLE_NOTE } from "@/components/funnel/samples";
import { MOCK_COMPARISON, SAMPLE_BORROWERS } from "@/lib/mocks";
import { computePlans } from "@/lib/engine";

beforeEach(() => {
  window.localStorage.clear();
});

const card = (name: RegExp) => screen.getByRole("region", { name });

describe("ResultsView", () => {
  it("leads with the recommendation: plan, whole-dollar payment, the reason and the balance chip", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const rec = within(screen.getByTestId("recommendation"));
    expect(rec.getByRole("heading", { name: /Your best plan: RAP/ })).toBeInTheDocument();
    expect(rec.getByText("Repayment Assistance Plan")).toBeInTheDocument();
    expect(rec.getByTestId("hero-number")).toHaveTextContent("$129");
    expect(rec.getByText(MOCK_COMPARISON.reason)).toBeInTheDocument();
    const chips = within(rec.getByTestId("hero-chips"));
    expect(chips.getByText("↓ $600 this year")).toBeInTheDocument();
    expect(chips.queryByText("Counts toward PSLF ✓")).toBeNull();
    expect(rec.getByText(/Rules as of Nov 1, 2026/)).toBeInTheDocument();
  });

  it("shows the PSLF chip on a PSLF track", () => {
    render(<ResultsView comparison={computePlans(SAMPLE_BORROWERS.F4)} onChange={() => undefined} />);
    expect(within(screen.getByTestId("hero-chips")).getByText("Counts toward PSLF ✓")).toBeInTheDocument();
  });

  it("the dated action plan opens on its own paywall page, with the price up front", async () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    expect(await screen.findByRole("link", { name: "Get my dated action plan" })).toHaveAttribute("href", "/paywall");
    expect(screen.getByText(/From \$9\/mo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Check my servicer statement" })).toHaveAttribute("href", "/audit");
  });

  it("explains why the cheapest plan isn't the one we recommend", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const callout = screen.getByTestId("cheapest-callout");
    expect(callout).toHaveTextContent("Why not the cheapest?");
    expect(callout).toHaveTextContent("IBR has the lowest payment at $116.83 a month");
  });

  it("'Things to act on' lists urgent warnings first, marked, before the plan cards", () => {
    const { container } = render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    expect(screen.getByRole("heading", { name: "Things to act on" })).toBeInTheDocument();
    const alerts = [...container.querySelectorAll("[data-severity]")];
    expect(alerts.length).toBeGreaterThan(1);
    expect(alerts[0]).toHaveAttribute("data-severity", "danger");
    expect(alerts[0]).toHaveTextContent("Your SAVE deadline");
    const grows = screen.getByText("IBR would grow your balance");
    expect(grows.compareDocumentPosition(card(/^RAP plan/)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("the recommended plan card carries its badge, cents, balance change, PSLF line, forgiveness rule and rules date", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const rap = card(/^RAP plan/);
    expect(rap).toHaveTextContent("Recommended");
    expect(within(rap).getByText("$129.17")).toBeInTheDocument();
    expect(rap).toHaveTextContent("Balance in 12 months: shrinks by $600.00");
    expect(rap).toHaveTextContent("Payments count toward PSLF");
    expect(rap).toHaveTextContent(/Under current rules, a balance left after 30 years/);
    expect(rap).toHaveTextContent("34 CFR 685.209(f)(5)");
    expect(rap).toHaveTextContent("Rules as of Nov 1, 2026");
  });

  it("marks the cheapest-per-month plan and says when its balance grows", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const ibr = card(/^IBR plan/);
    expect(ibr).toHaveTextContent("Cheapest per month");
    expect(ibr).toHaveTextContent("Balance in 12 months: grows by $1,198.08");
  });

  it("an unavailable plan says why, at full text strength", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const tiered = card(/Tiered Standard plan/);
    expect(tiered).toHaveTextContent("Unavailable");
    expect(tiered).toHaveTextContent("Only for borrowers with a loan made on or after July 1, 2026");
    expect(tiered.className).not.toMatch(/opacity-/);
  });

  it("a sample borrower's results carry the sample banner with a way to use your own numbers", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} notes={[SAMPLE_NOTE]} onChange={() => undefined} />);
    const banner = within(screen.getByTestId("sample-banner"));
    expect(banner.getByText(/Sample borrower — these are not your numbers/)).toBeInTheDocument();
    expect(banner.getByRole("link", { name: "Check my own numbers" })).toHaveAttribute("href", "/check");
  });

  it("with no answers, offers to start the check or try a sample", () => {
    render(<ResultsView comparison={null} onChange={() => undefined} />);
    expect(screen.getByRole("link", { name: "Start the check" })).toHaveAttribute("href", "/check");
    expect(screen.getByRole("button", { name: "Try: single parent, 2 kids" })).toBeInTheDocument();
  });

  it("no eligible loans: says so, with no giant number, no chips and no paid CTA", () => {
    render(<ResultsView comparison={computePlans({ ...SAMPLE_BORROWERS.F1, loans: [] })} onChange={() => undefined} />);
    expect(screen.getByRole("heading", { name: "We can't compare plans for these loans" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Your best plan:/ })).toBeNull();
    expect(screen.queryByTestId("hero-number")).toBeNull();
    expect(screen.queryByTestId("hero-chips")).toBeNull();
    expect(screen.queryByRole("link", { name: /dated action plan/ })).toBeNull();
  });

  it("without a filing comparison, shows no joint vs separate panel", () => {
    render(<ResultsView comparison={computePlans(SAMPLE_BORROWERS.F4)} filing={undefined} onChange={() => undefined} />);
    expect(screen.queryByTestId("filing-panel")).toBeNull();
  });

  it("ends with the results disclaimer", () => {
    const { container } = render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    expect(container.querySelector('[data-variant="results"]')).not.toBeNull();
  });
});

describe("ResultsScreen", () => {
  const save = (v: unknown) => window.localStorage.setItem("slg_session_borrowerInput", JSON.stringify(v));

  it("opening /results with no saved answers shows the start options, not a crash", async () => {
    render(<ResultsScreen />);
    expect(await screen.findByRole("link", { name: "Start the check" })).toBeInTheDocument();
  });

  it("garbage in storage shows the start options, not a crash", async () => {
    save({ agi: "x" });
    render(<ResultsScreen />);
    expect(await screen.findByRole("link", { name: "Start the check" })).toBeInTheDocument();
  });

  it("toggling dependents to 0 and to 6 recomputes instantly", async () => {
    save(SAMPLE_BORROWERS.F2b);
    render(<ResultsScreen />);
    expect(await screen.findByRole("heading", { name: /Your best plan: RAP/ })).toBeInTheDocument();
    expect(within(card(/^RAP plan/)).getByText("$129.17")).toBeInTheDocument();

    const minus = screen.getByRole("button", { name: "Remove a dependent" });
    fireEvent.click(minus);
    fireEvent.click(minus);
    expect(within(card(/^RAP plan/)).getByText("$229.17")).toBeInTheDocument();
    expect(within(card(/^IBR plan/)).getByText("$258.83")).toBeInTheDocument(); // family size 1

    const plus = screen.getByRole("button", { name: "Add a dependent" });
    for (let i = 0; i < 6; i++) fireEvent.click(plus);
    expect(within(card(/^RAP plan/)).getByText("$10.00")).toBeInTheDocument();
  });

  it("what-ifs never overwrite the saved answers, and Reset brings them back", async () => {
    save(SAMPLE_BORROWERS.F2b);
    render(<ResultsScreen />);
    await screen.findByRole("heading", { name: /Your best plan: RAP/ });
    expect(screen.getByRole("heading", { name: "What if?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove a dependent" }));
    expect(JSON.parse(window.localStorage.getItem("slg_session_borrowerInput")!).dependents).toBe(2);
    fireEvent.click(screen.getByRole("button", { name: "Reset to my answers" }));
    expect(within(card(/^RAP plan/)).getByText("$129.17")).toBeInTheDocument();
  });

  it("switching a single borrower to joint asks for the spouse's income and uses it", async () => {
    save(SAMPLE_BORROWERS.F2a);
    render(<ResultsScreen />);
    await screen.findByRole("heading", { name: /Your best plan: RAP/ });
    fireEvent.change(screen.getByLabelText("Tax filing status"), { target: { value: "mfj" } });
    expect(screen.getByTestId("spouse-income-missing")).toHaveTextContent(/spouse/i);
    fireEvent.change(screen.getByLabelText(/spouse's income/i), { target: { value: "10,000" } });
    expect(screen.queryByTestId("spouse-income-missing")).toBeNull();
    expect(within(card(/^RAP plan/)).getByText("$325.00")).toBeInTheDocument(); // joint AGI 65k
    expect(within(card(/^IBR plan/)).getByText("$271.17")).toBeInTheDocument(); // family size 2
  });

  it("a sample borrower's results carry the sample banner", async () => {
    save(SAMPLE_BORROWERS.F2b);
    window.localStorage.setItem("slg_funnel_notes", JSON.stringify([SAMPLE_NOTE]));
    render(<ResultsScreen />);
    expect(await screen.findByTestId("sample-banner")).toHaveTextContent(/Sample borrower — these are not your numbers/);
  });

  it("other notes about the answers are shown, without a sample banner", async () => {
    save(SAMPLE_BORROWERS.F2b);
    window.localStorage.setItem("slg_funnel_notes", JSON.stringify(["You weren't sure whether you had loans before July 2014."]));
    render(<ResultsScreen />);
    expect(await screen.findByText("You weren't sure whether you had loans before July 2014.")).toBeInTheDocument();
    expect(screen.queryByTestId("sample-banner")).toBeNull();
  });

  it("married teacher (joint, spouse income known): shows the joint vs separate panel with the net saving", async () => {
    save(SAMPLE_BORROWERS.F4);
    render(<ResultsScreen />);
    const panel = await screen.findByTestId("filing-panel");
    expect(panel).toHaveTextContent("$4,044.88");
    expect(panel).toHaveTextContent("$650.00");
  });
});

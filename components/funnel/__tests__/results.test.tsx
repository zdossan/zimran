// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import { ResultsView } from "@/components/funnel/ResultsView";
import { ResultsScreen } from "@/components/funnel/ResultsScreen";
import { MOCK_COMPARISON, SAMPLE_BORROWERS } from "@/lib/mocks";
import { computePlans } from "@/lib/engine";
import { CHART_COLORS } from "@/components/funnel/PaymentChart";

beforeAll(() => {
  // Recharts' ResponsiveContainer needs ResizeObserver, which jsdom lacks.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

beforeEach(() => {
  window.localStorage.clear();
});

const card = (name: RegExp) => screen.getByRole("region", { name });

describe("ResultsView", () => {
  it("shows the recommendation, the payment, the cheapest-vs-recommended callout and the balance warning", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    expect(screen.getByRole("heading", { name: /Your best plan: RAP/ })).toBeInTheDocument();
    expect(within(card(/^RAP plan/)).getByText("$129.17")).toBeInTheDocument();
    expect(screen.getByTestId("cheapest-callout")).toHaveTextContent("IBR");
    expect(screen.getByText("IBR would grow your balance")).toBeInTheDocument();
  });

  it("puts the rule references and the rules date next to each plan's numbers", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const rap = card(/^RAP plan/);
    expect(rap).toHaveTextContent("34 CFR 685.209(f)(5)");
    expect(rap).toHaveTextContent("Rules as of Nov 1, 2026");
  });

  it("greys out an unavailable plan with its reason", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    expect(card(/Tiered Standard plan/)).toHaveTextContent("Only for borrowers with a loan made on or after July 1, 2026");
  });

  it("with no answers, offers to start the check or try a sample", () => {
    render(<ResultsView comparison={null} onChange={() => undefined} />);
    expect(screen.getByRole("link", { name: "Start the check" })).toHaveAttribute("href", "/check");
    expect(screen.getByRole("button", { name: "Try: single parent, 2 kids" })).toBeInTheDocument();
  });

  it("when no loans are covered, says so instead of recommending a plan", () => {
    const c = computePlans({ ...SAMPLE_BORROWERS.F1, loans: [] });
    render(<ResultsView comparison={c} onChange={() => undefined} />);
    expect(screen.queryByRole("heading", { name: /Your best plan:/ })).toBeNull();
    expect(screen.getAllByText("We can't compare plans for these loans").length).toBeGreaterThan(0);
  });

  it("without a filing comparison, shows no joint vs separate panel", () => {
    const c = computePlans(SAMPLE_BORROWERS.F4);
    render(<ResultsView comparison={c} filing={undefined} onChange={() => undefined} />);
    expect(screen.queryByTestId("filing-panel")).toBeNull();
  });

  it("puts the dated action plan behind the action-plan paywall, opened by the CTA", async () => {
    const { container } = render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    fireEvent.click(await screen.findByRole("button", { name: "Get my dated action plan · from $9/mo" }));
    expect(container.querySelector('[data-feature="action-plan"]')).not.toBeNull();
    expect(container.querySelector("#action-plan-panel")).not.toHaveAttribute("hidden");
  });

  it("warn-level warnings sit right after the urgent ones, before the CTA, under 'Watch out for'", async () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const grows = screen.getByText("IBR would grow your balance");
    const cta = await screen.findByRole("button", { name: /dated action plan/ });
    expect(grows.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Watch out for" })).toBeInTheDocument();
  });

  it("plan rows say what the yearly figure is, keep full-strength text when unavailable, and keep summaries phrasing-only", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    expect(card(/^RAP plan/)).toHaveTextContent("Balance −$600.00/yr");
    expect(card(/Tiered Standard plan/).className).not.toMatch(/opacity-/);
    expect(card(/^RAP plan/).querySelector("summary p, summary div")).toBeNull();
  });

  it("hero shows the whole-dollar answer and the balance chip, without a PSLF chip off the PSLF track", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    expect(screen.getByTestId("hero-number")).toHaveTextContent("$129");
    const chips = within(screen.getByTestId("hero-chips"));
    expect(chips.getByText("↓ $600 this year")).toBeInTheDocument();
    expect(chips.queryByText("Counts toward PSLF ✓")).toBeNull();
  });

  it("hero shows the PSLF chip on a PSLF track", () => {
    render(<ResultsView comparison={computePlans(SAMPLE_BORROWERS.F4)} onChange={() => undefined} />);
    expect(within(screen.getByTestId("hero-chips")).getByText("Counts toward PSLF ✓")).toBeInTheDocument();
  });

  it("the RAP row carries the BEST badge, cents and the rules", () => {
    render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const rap = card(/^RAP plan/);
    expect(rap).toHaveTextContent("BEST");
    expect(rap).toHaveTextContent("$129.17");
    expect(rap).toHaveTextContent("34 CFR 685.209(f)(5)");
    expect(rap).toHaveTextContent("Rules as of Nov 1, 2026");
  });

  it("chart colours are the validated palette", () => {
    expect(CHART_COLORS).toEqual({ recommended: "#4840BB", other: "#8A86C8", shrinks: "#4840BB", grows: "#E0245E" });
  });

  it("danger warnings come first and are marked", () => {
    const { container } = render(<ResultsView comparison={MOCK_COMPARISON} onChange={() => undefined} />);
    const alerts = [...container.querySelectorAll("[data-severity]")];
    expect(alerts.length).toBeGreaterThan(1);
    expect(alerts[0]).toHaveAttribute("data-severity", "danger");
    expect(alerts[0]).toHaveTextContent("Your SAVE deadline");
  });

  it("no eligible loans: no giant number, no chips and no CTA", () => {
    render(<ResultsView comparison={computePlans({ ...SAMPLE_BORROWERS.F1, loans: [] })} onChange={() => undefined} />);
    expect(screen.getByRole("heading", { name: "We can't compare plans for these loans" })).toBeInTheDocument();
    expect(screen.queryByTestId("hero-number")).toBeNull();
    expect(screen.queryByTestId("hero-chips")).toBeNull();
    expect(screen.queryByRole("button", { name: /dated action plan/ })).toBeNull();
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
    window.localStorage.setItem("slg_funnel_notes", JSON.stringify(["Sample borrower — these are not your numbers. Start the check to see yours."]));
    render(<ResultsScreen />);
    expect(await screen.findByText(/Sample borrower — these are not your numbers/)).toBeInTheDocument();
  });

  it("describes forgiveness as a current rule, not a promise", async () => {
    save(SAMPLE_BORROWERS.F2b);
    render(<ResultsScreen />);
    await screen.findByRole("heading", { name: /Your best plan: RAP/ });
    expect(card(/^RAP plan/)).toHaveTextContent(/Under current rules/);
  });

  it("married teacher (joint, spouse income known): shows the joint vs separate panel with the net saving", async () => {
    save(SAMPLE_BORROWERS.F4);
    render(<ResultsScreen />);
    const panel = await screen.findByTestId("filing-panel");
    expect(panel).toHaveTextContent("$4,044.88");
    expect(panel).toHaveTextContent("$650.00");
  });
});

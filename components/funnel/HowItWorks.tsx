// "How it works" and the two verbatim borrower quotes (docs/research/08h-reddit-quotes.md #2 and #10).
const STEPS = [
  { title: "Answer 6 questions", body: "Income, family, loans and where you work. No login, no email, never your FSA ID." },
  { title: "See every plan with the rule behind each number", body: "RAP, IBR, Standard and Tiered side by side, the one we recommend, and why." },
  { title: "Upload a statement — we flag errors and draft your letter", body: "We check your servicer's math against the rules and write the letter for you to send." },
];

// Verbatim, author's spelling kept; trimmed only at the start ("…").
const QUOTES = [
  "…SAVE was 497 new IDR plan is 2157 a month. Trying to figure out if I should sell my house or take my child out of daycare and have my wife split a vehicle.",
  "…My interest subsidy should be 93.21/month. I received $53.11.",
];

export function HowItWorks() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="how-heading" className="space-y-4">
        <h2 id="how-heading" className="text-xl font-semibold">
          How it works
        </h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="space-y-1 rounded-xl border p-4">
              <p className="text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="quotes-heading" className="space-y-4">
        <h2 id="quotes-heading" className="text-xl font-semibold">
          Borrowers are seeing this right now
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUOTES.map((q) => (
            <figure key={q} className="space-y-2 rounded-xl bg-muted/50 p-4">
              <blockquote className="text-sm italic">“{q}”</blockquote>
              <figcaption className="text-xs text-muted-foreground">— r/StudentLoans, 2026</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

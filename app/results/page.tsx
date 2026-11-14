// PLACEHOLDER — owned by P2 (plans/02-funnel.md, Task 3: results).
import { MOCK_COMPARISON } from "@/lib/mocks";

export default function ResultsPage() {
  return (
    <section className="space-y-2">
      <p className="text-xs uppercase text-muted-foreground">Results: owned by P2</p>
      <p className="text-lg">Recommended: {MOCK_COMPARISON.recommended}</p>
    </section>
  );
}

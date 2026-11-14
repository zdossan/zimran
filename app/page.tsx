// PLACEHOLDER — owned by P2 (plans/02-funnel.md, Task 4: landing page).
import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-4">
      <p className="text-xs uppercase text-muted-foreground">Funnel: owned by P2</p>
      <h1 className="text-2xl font-bold">See your cheapest legal plan in 60 seconds. No login.</h1>
      <Link href="/check" className="underline">Start the free check</Link>
    </section>
  );
}

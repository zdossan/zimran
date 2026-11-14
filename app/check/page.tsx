import type { Metadata } from "next";
import { Quiz } from "@/components/funnel/Quiz";
import { SampleButtons } from "@/components/funnel/SampleButtons";

export const metadata: Metadata = {
  title: "Free plan check — Student Loan Guardian",
  description: "Six questions, no login. See every federal repayment plan you qualify for and the rule behind each number.",
};

export default function CheckPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Find your cheapest legal plan</h1>
        <p className="text-muted-foreground">Six short questions. No login, no email, and we never ask for your FSA ID.</p>
      </header>
      <Quiz />
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Or see a sample borrower</h2>
        <SampleButtons />
      </section>
    </div>
  );
}

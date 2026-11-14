import type { Metadata } from "next";
import { Quiz } from "@/components/funnel/Quiz";
import { SampleButtons } from "@/components/funnel/SampleButtons";

export const metadata: Metadata = {
  title: "Free plan check — Student Loan Guardian",
  description: "Six questions, no login. See every federal repayment plan you qualify for and the rule behind each number.",
};

export default function CheckPage() {
  return (
    <div>
      {/* No spacing utilities before the quiz: its band must sit flush under the header. */}
      <h1 className="sr-only">Find your cheapest legal plan</h1>
      <Quiz />
      <section className="mx-auto mt-10 max-w-xl space-y-2">
        <h2 className="text-sm font-bold">Or see a sample borrower</h2>
        <SampleButtons />
      </section>
    </div>
  );
}

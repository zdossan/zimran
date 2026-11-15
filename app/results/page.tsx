import type { Metadata } from "next";
import { ResultsScreen } from "@/components/funnel/ResultsScreen";

export const metadata: Metadata = {
  title: "Your repayment plans — Owen",
  description: "Every federal repayment plan you qualify for, the one we recommend and why, with the rule behind each number.",
};

export default function ResultsPage() {
  return (
    <div>
      <h1 className="sr-only">Your repayment plans</h1>
      <ResultsScreen />
    </div>
  );
}

import type { Metadata } from "next";
import { Quiz } from "@/components/funnel/Quiz";
import { isSampleKey } from "@/components/funnel/samples";

export const metadata: Metadata = {
  title: "Free plan check — Owen",
  description: "Six questions, no login. See every federal repayment plan you qualify for and the rule behind each number.",
};

/** `/check?sample=F2b` (or F4) opens the quiz pre-filled with that sample borrower; anything else is ignored. */
export default async function CheckPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { sample } = await searchParams;
  return (
    <div className="pb-10">
      <h1 className="sr-only">Find your cheapest legal plan</h1>
      <Quiz initialSample={isSampleKey(sample) ? sample : undefined} />
    </div>
  );
}

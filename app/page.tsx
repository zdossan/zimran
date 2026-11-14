import { Hero } from "@/components/funnel/Hero";
import { HowItWorks } from "@/components/funnel/HowItWorks";

export default function Home() {
  return (
    <div className="space-y-10">
      <Hero />
      <HowItWorks />
    </div>
  );
}

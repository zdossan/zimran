import { Hero } from "@/components/funnel/Hero";
import { HowItWorks } from "@/components/funnel/HowItWorks";
import { StatTiles } from "@/components/funnel/StatTiles";

export default function Home() {
  return (
    <div>
      {/* The hero band must be the first element so it sits flush under the header. */}
      <Hero />
      <div className="space-y-12">
        <StatTiles />
        <HowItWorks />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { PaywallScreen } from "@/components/funnel/PaywallScreen";

export const metadata: Metadata = {
  title: "Your dated action plan — Owen",
  description: "$9/month or $79/year. A dated plan of what to do and by when, letter templates and your Owen report. Cancel anytime.",
};

export default function PaywallPage() {
  return <PaywallScreen />;
}

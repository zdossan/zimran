import type { Metadata } from "next";
import { DashboardScreen } from "@/components/plan/DashboardScreen";

export const metadata: Metadata = {
  title: "My loans — Owen",
  description: "Your student loan balance, this month's payment, next deadline and progress, in one place. No sign-up.",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}

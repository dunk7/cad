import ScheduleWizard from "@/components/schedule/ScheduleWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule Now",
  description:
    "Schedule your California Art Delivery service online. Payment is required to confirm your order.",
};

export default function SchedulePage() {
  return <ScheduleWizard />;
}

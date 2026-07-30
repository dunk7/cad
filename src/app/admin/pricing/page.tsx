import { isAdminAuthenticated } from "@/lib/admin/auth";
import PricingEditor from "@/components/admin/PricingEditor";
import { redirect } from "next/navigation";

export default async function AdminPricingPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <PricingEditor />;
}

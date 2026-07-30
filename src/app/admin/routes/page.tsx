import { isAdminAuthenticated } from "@/lib/admin/auth";
import RoutesEditor from "@/components/admin/RoutesEditor";
import { redirect } from "next/navigation";

export default async function AdminRoutesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <RoutesEditor />;
}

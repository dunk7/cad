import AdminShell from "@/components/admin/AdminShell";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  return <AdminShell authed={authed}>{children}</AdminShell>;
}

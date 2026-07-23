import { headers } from "next/headers";
import { getSiteContent } from "./actions";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const initialData = await getSiteContent();
  const headersList = await headers();
  const adminUsername = headersList.get("x-admin-username") || "";

  return (
    <AdminDashboard initialData={initialData} adminUsername={adminUsername} />
  );
}

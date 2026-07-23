import { getSiteContent } from "./actions";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const initialData = await getSiteContent();

  return (
    <AdminDashboard initialData={initialData} />
  );
}

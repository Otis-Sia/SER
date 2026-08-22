import { getSiteContent } from "./actions";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: 'Admin | Scouts Emergency Response',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const initialData = await getSiteContent();

  return (
    <AdminDashboard initialData={initialData} />
  );
}

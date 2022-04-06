import { json, LoaderFunction, Outlet } from "remix";
import AppLayout from "~/components/app/AppLayout";
import { loadAdminData } from "~/utils/data/useAdminData";

export let loader: LoaderFunction = async ({ request }) => {
  const data = await loadAdminData(request);
  return json(data);
};

export default function AdminRoute() {
  return (
    <AppLayout layout="admin">
      <Outlet />
    </AppLayout>
  );
}

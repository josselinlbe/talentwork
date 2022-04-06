import { json, LoaderFunction, Outlet } from "remix";
import AppLayout from "~/components/app/AppLayout";
import { loadAdminData } from "~/utils/data/useAdminData";

export let loader: LoaderFunction = async ({ request, params }) => {
  const data = await loadAdminData(request, params);
  return json(data);
};

export default function AdminRoute() {
  return (
    <AppLayout layout="admin">
      <Outlet />
    </AppLayout>
  );
}

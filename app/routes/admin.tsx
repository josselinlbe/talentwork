import { ActionFunction, json, LoaderFunction, Outlet, useCatch } from "remix";
import AppLayout from "~/components/app/AppLayout";
import { loadAppData } from "~/utils/data/useAppData";
import { callAppAction } from "~/utils/actions/callAppAction";
import { requireAdminUser } from "~/utils/loaders.middleware";

export let loader: LoaderFunction = async ({ request }) => {
  const data = await loadAppData(request);
  await requireAdminUser(request);
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  return callAppAction(request, "/admin/tenants");
};

export default function AdminRoute() {
  return (
    <AppLayout layout="admin">
      <Outlet />
    </AppLayout>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div>Server Error: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <div>Client Error: {caught.status}</div>;
}

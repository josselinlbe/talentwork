import { useEffect } from "react";
import type { LoaderFunction} from "remix";
import { json, Outlet, useNavigate } from "remix";
import AppLayout from "~/components/app/AppLayout";
import { loadAppData, useAppData } from "~/utils/data/useAppData";
import { requireAuthorization } from "~/utils/loaders.middleware";

export let loader: LoaderFunction = async ({ request, params }) => {
  const data = await loadAppData(request, params);
  const currentPath = new URL(request.url).pathname;
  await requireAuthorization(currentPath, data.currentRole, params);
  return json(data);
};

export default function AppRoute() {
  const appData = useAppData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!appData.currentTenant) {
      navigate("/app");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appData.currentTenant]);

  return (
    <div className="bg-white min-h-screen">
      <AppLayout layout="app">
        <Outlet />
      </AppLayout>
    </div>
  );
}

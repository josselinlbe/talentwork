import { useEffect } from "react";
import { json, LoaderFunction, Outlet, useNavigate } from "remix";
import AppLayout from "~/components/app/AppLayout";
import { loadAppData, useAppData } from "~/utils/data/useAppData";
import { updateUserDefaultTenantId } from "~/utils/db/users.db.server";
import { requireAuthorization } from "~/utils/loaders.middleware";
import { getTenantUrl } from "~/utils/services/urlService";
import { getUserInfo } from "~/utils/session.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  const data = await loadAppData(request, params);
  const currentPath = new URL(request.url).pathname;
  await requireAuthorization(currentPath, data.currentRole, params, data.entities);
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);
  await updateUserDefaultTenantId({ defaultTenantId: tenantUrl.tenantId }, userInfo.userId);
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

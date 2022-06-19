import { json, LoaderFunction, Outlet, useLoaderData } from "remix";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import { useAppData } from "~/utils/data/useAppData";
import { ApiKeyLogWithDetails, ApiKeyWithDetails, getAllApiKeyLogs, getApiKeys } from "~/utils/db/apiKeys.db.server";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  apiKeys: ApiKeyWithDetails[];
  apiKeyLogs: ApiKeyLogWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const tenantUrl = await getTenantUrl(params);
  const apiKeys = await getApiKeys(tenantUrl.tenantId);
  const apiKeyLogs = await getAllApiKeyLogs(tenantUrl.tenantId);
  const data: LoaderData = {
    apiKeys,
    apiKeyLogs,
  };
  return json(data);
};

export default function AdminApiKeysRoute() {
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();
  return (
    <>
      <ApiKeysTable
        entities={appData.entities}
        items={data.apiKeys}
        logs={data.apiKeyLogs}
        withTenant={false}
        canCreate={appData.permissions.includes("app.settings.apiKeys.create")}
      />
      <Outlet />
    </>
  );
}

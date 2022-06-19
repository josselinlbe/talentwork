import { json, LoaderFunction, Outlet, useLoaderData } from "remix";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import { useAdminData } from "~/utils/data/useAdminData";
import { ApiKeyLogWithDetails, ApiKeyWithDetails, getAllApiKeyLogs, getAllApiKeys } from "~/utils/db/apiKeys.db.server";

type LoaderData = {
  apiKeys: ApiKeyWithDetails[];
  apiKeyLogs: ApiKeyLogWithDetails[];
};
export let loader: LoaderFunction = async ({ request }) => {
  const apiKeys = await getAllApiKeys();
  const apiKeyLogs = await getAllApiKeyLogs();
  const data: LoaderData = {
    apiKeys,
    apiKeyLogs,
  };
  return json(data);
};

export default function AdminApiKeysRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  return (
    <>
      <ApiKeysTable
        canCreate={adminData.permissions.includes("admin.apiKeys.create")}
        entities={adminData.entities}
        items={data.apiKeys}
        logs={data.apiKeyLogs}
        withTenant={true}
      />
      <Outlet />
    </>
  );
}

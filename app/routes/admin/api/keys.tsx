import { json, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import { useAdminData } from "~/utils/data/useAdminData";
import { ApiKeyLogSimple, ApiKeyWithDetails, getAllApiKeyLogsSimple, getAllApiKeys } from "~/utils/db/apiKeys.db.server";

type LoaderData = {
  apiKeys: ApiKeyWithDetails[];
  apiKeyLogs: ApiKeyLogSimple[];
};
export let loader: LoaderFunction = async () => {
  const apiKeys = await getAllApiKeys();
  const apiKeyLogs = await getAllApiKeyLogsSimple();
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

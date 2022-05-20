import { json, LoaderFunction, useLoaderData } from "remix";
import ApiKeyLogsTable from "~/components/core/apiKeys/ApiKeyLogsTable";
import { ApiKeyLogWithDetails, getTenantApiKeyLogs } from "~/utils/db/apiKeys.db.server";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  items: ApiKeyLogWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const tenantUrl = await getTenantUrl(params);
  const items = await getTenantApiKeyLogs(tenantUrl.tenantId);
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function AdminApiLogsRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <ApiKeyLogsTable withTenant={false} items={data.items} />
    </>
  );
}

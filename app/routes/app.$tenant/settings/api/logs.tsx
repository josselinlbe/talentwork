import { json, LoaderFunction, useLoaderData } from "remix";
import ApiKeyLogsTable from "~/components/core/apiKeys/ApiKeyLogsTable";
import { ApiKeyLogWithDetails, getTenantApiKeyLogs } from "~/utils/db/apiKeys.db.server";

type LoaderData = {
  items: ApiKeyLogWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const items = await getTenantApiKeyLogs(params.tenant ?? "");
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

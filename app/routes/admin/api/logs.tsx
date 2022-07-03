import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ApiKeyLogsTable from "~/components/core/apiKeys/ApiKeyLogsTable";
import { ApiKeyLogWithDetails, getAllApiKeyLogs } from "~/utils/db/apiKeys.db.server";

type LoaderData = {
  items: ApiKeyLogWithDetails[];
};
export let loader: LoaderFunction = async () => {
  const items = await getAllApiKeyLogs();
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function AdminApiLogsRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <ApiKeyLogsTable withTenant={true} items={data.items} />
    </>
  );
}

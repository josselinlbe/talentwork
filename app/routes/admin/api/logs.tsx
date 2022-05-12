import { useTranslation } from "react-i18next";
import { json, LoaderFunction, useLoaderData, useNavigate } from "remix";
import ApiKeyLogsTable from "~/components/core/apiKeys/ApiKeyLogsTable";
import { useAdminData } from "~/utils/data/useAdminData";
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

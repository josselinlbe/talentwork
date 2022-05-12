import { json, LoaderFunction, useLoaderData } from "remix";
import LogsTable from "~/components/app/events/LogsTable";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { getLogs, LogWithDetails } from "~/utils/db/logs.db.server";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  items: LogWithDetails[];
};

export let loader: LoaderFunction = async ({ params }) => {
  const tenantUrl = await getTenantUrl(params);

  const items = await getLogs(tenantUrl.tenantId);

  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function Events() {
  const data = useLoaderData<LoaderData>();
  return (
    <IndexPageLayout>
      <LogsTable withTenant={false} items={data.items} />
    </IndexPageLayout>
  );
}

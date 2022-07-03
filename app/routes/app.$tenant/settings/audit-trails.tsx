import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import LogsTable from "~/components/app/events/LogsTable";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { getLogs, LogWithDetails } from "~/utils/db/logs.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  items: LogWithDetails[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.settings.auditTrails.view", tenantUrl.tenantId);

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

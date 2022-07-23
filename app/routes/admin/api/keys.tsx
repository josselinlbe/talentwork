import { json, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
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
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  return (
    <>
      <IndexPageLayout
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: t("models.apiKey.plural"),
            routePath: "/admin/api/keys",
          },
          {
            name: t("models.apiKey.logs"),
            routePath: "/admin/api/logs",
          },
        ]}
      >
        <ApiKeysTable
          canCreate={adminData.permissions.includes("admin.apiKeys.create")}
          entities={adminData.entities}
          items={data.apiKeys}
          logs={data.apiKeyLogs}
          withTenant={true}
        />
        <Outlet />
      </IndexPageLayout>
    </>
  );
}

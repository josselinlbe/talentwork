import { json, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import { useAppData } from "~/utils/data/useAppData";
import { ApiKeyLogWithDetails, ApiKeyWithDetails, getAllApiKeyLogs, getApiKeys } from "~/utils/db/apiKeys.db.server";
import { getPlanFeatureUsage } from "~/utils/services/subscriptionService";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  apiKeys: ApiKeyWithDetails[];
  apiKeyLogs: ApiKeyLogWithDetails[];
  featurePlanUsage: PlanFeatureUsageDto | undefined;
};
export let loader: LoaderFunction = async ({ params }) => {
  const tenantUrl = await getTenantUrl(params);
  const apiKeys = await getApiKeys(tenantUrl.tenantId);
  const apiKeyLogs = await getAllApiKeyLogs(tenantUrl.tenantId);
  const featurePlanUsage = await getPlanFeatureUsage(tenantUrl.tenantId, DefaultFeatures.API);
  const data: LoaderData = {
    apiKeys,
    apiKeyLogs,
    featurePlanUsage,
  };
  return json(data);
};

export default function AdminApiKeysRoute() {
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();
  return (
    <>
      <CheckPlanFeatureLimit item={data.featurePlanUsage} hideContent={false}>
        <div className="space-y-2">
          <ApiKeysTable
            entities={appData.entities}
            items={data.apiKeys}
            logs={data.apiKeyLogs}
            withTenant={false}
            canCreate={appData.permissions.includes("app.settings.apiKeys.create")}
          />
          {data.featurePlanUsage?.enabled && (
            <InfoBanner title="API usage" text="API calls remaining: ">
              <b>Remaining {data.featurePlanUsage?.remaining}</b>
            </InfoBanner>
          )}
        </div>
        <Outlet />
      </CheckPlanFeatureLimit>
    </>
  );
}

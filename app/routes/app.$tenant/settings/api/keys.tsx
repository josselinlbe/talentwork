import { json, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppData } from "~/utils/data/useAppData";
import { ApiKeyLogSimple, ApiKeyWithDetails, getAllApiKeyLogsSimple, getApiKeys } from "~/utils/db/apiKeys.db.server";
import { getPlanFeatureUsage } from "~/utils/services/subscriptionService";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  apiKeys: ApiKeyWithDetails[];
  apiKeyLogs: ApiKeyLogSimple[];
  featurePlanUsage: PlanFeatureUsageDto | undefined;
};
export let loader: LoaderFunction = async ({ params }) => {
  const tenantUrl = await getTenantUrl(params);
  const apiKeys = await getApiKeys(tenantUrl.tenantId);
  const apiKeyLogs = await getAllApiKeyLogsSimple(tenantUrl.tenantId);
  const featurePlanUsage = await getPlanFeatureUsage(tenantUrl.tenantId, DefaultFeatures.API);
  const data: LoaderData = {
    apiKeys,
    apiKeyLogs,
    featurePlanUsage,
  };
  return json(data);
};

export default function AdminApiKeysRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();
  const params = useParams();
  return (
    <>
      <IndexPageLayout
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: t("models.apiKey.plural"),
            routePath: UrlUtils.currentTenantUrl(params, "settings/api/keys"),
          },
          {
            name: t("models.apiKey.logs"),
            routePath: UrlUtils.currentTenantUrl(params, "settings/api/logs"),
          },
        ]}
      >
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
      </IndexPageLayout>
    </>
  );
}

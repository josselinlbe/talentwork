import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import { AdminLoaderData, loadAdminData, useAdminData } from "~/utils/data/useAdminData";
import { DashboardStats } from "~/components/ui/stats/DashboardStats";
import { getAdminDashboardStats } from "~/utils/services/adminDashboardService";
import { getSetupSteps } from "~/utils/services/setupService";
import SetupSteps from "~/components/admin/SetupSteps";
import ProfileBanner from "~/components/app/ProfileBanner";
import { adminGetAllTenantsWithUsage, TenantWithUsage } from "~/utils/db/tenants.db.server";
import TenantsTable from "~/components/core/tenants/TenantsTable";
import { SetupItem } from "~/application/dtos/setup/SetupItem";
import { Stat } from "~/application/dtos/stats/Stat";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

type LoaderData = AdminLoaderData & {
  title: string;
  stats: Stat[];
  // entitiesStats: Stat[];
  setupSteps: SetupItem[];
  tenants: TenantWithUsage[];
  tenantsPagination: PaginationDto;
};

export let loader: LoaderFunction = async ({ request }) => {
  const { t } = await i18nHelper(request);
  const adminData = await loadAdminData(request);

  const stats = await getAdminDashboardStats(30);
  // const entitiesStats = await getCustomEntitiesDashboardStats(30);
  const setupSteps = await getSetupSteps();
  const currentPagination = getPaginationFromCurrentUrl(request);
  const tenants = await adminGetAllTenantsWithUsage(undefined, currentPagination);

  const data: LoaderData = {
    ...adminData,
    title: `${t("app.sidebar.dashboard")} | ${process.env.APP_NAME}`,
    stats,
    // entitiesStats,
    setupSteps,
    tenants: tenants.items,
    tenantsPagination: tenants.pagination,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminNavigationRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();

  return (
    <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
      {/*Page header */}
      <div className="hidden md:block bg-white shadow lg:border-t lg:border-gray-200">
        <ProfileBanner user={data.user} />
      </div>

      <div className="px-4 sm:px-8 max-w-5xl mx-auto py-5 grid gap-5">
        {adminData.permissions.includes("admin.dashboard.view") ? (
          <div className="space-y-5 overflow-hidden">
            <div className=" overflow-x-auto">
              {data.setupSteps.filter((f) => f.completed).length < data.setupSteps.length && <SetupSteps items={data.setupSteps} />}
            </div>

            <div className="space-y-3">
              <h3 className=" leading-4 font-medium text-gray-900">Last 30 days</h3>
              <DashboardStats items={data.stats} />
            </div>

            {/* <div className="space-y-2">
            <div className="flex items-center justify-between space-x-2">
              <h3 className=" leading-4 font-medium text-gray-900">Custom entities</h3>
              <ButtonSecondary to="/admin/entities/new">{t("shared.new")}</ButtonSecondary>
            </div>
            <DashboardStats items={data.entitiesStats} />
          </div> */}

            <div className="overflow-x-auto space-y-4">
              <h3 className="leading-4 font-medium text-gray-900">Tenants</h3>
              <TenantsTable items={data.tenants} pagination={data.tenantsPagination} />
            </div>
          </div>
        ) : (
          <div className="font-medium">You don't have permission to view the dashboard.</div>
        )}
      </div>
    </main>
  );
}

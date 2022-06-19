import { json, LoaderFunction, MetaFunction, useCatch, useLoaderData } from "remix";
import { useAppData } from "~/utils/data/useAppData";
import { DashboardLoaderData, loadDashboardData } from "~/utils/data/useDashboardData";
import { i18nHelper } from "~/locale/i18n.utils";
import { getAppDashboardStats } from "~/utils/services/appDashboardService";
import ProfileBanner from "~/components/app/ProfileBanner";
import { DashboardStats } from "~/components/ui/stats/DashboardStats";
import { getTenantUrl } from "~/utils/services/urlService";
import { Stat } from "~/application/dtos/stats/Stat";

type LoaderData = DashboardLoaderData & {
  title: string;
  stats: Stat[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const stats = await getAppDashboardStats(tenantUrl.tenantId, 30);

  const data: LoaderData = {
    title: `${t("app.sidebar.dashboard")} | ${process.env.APP_NAME}`,
    ...(await loadDashboardData(params)),
    stats,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function DashboardRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();

  return (
    <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
      {/*Page header */}
      <div className="hidden md:block bg-white shadow lg:border-t lg:border-gray-200">
        <ProfileBanner user={appData.user} />
      </div>

      <div className="px-4 sm:px-8 max-w-5xl mx-auto py-5 grid gap-5">
        {appData.permissions.includes("app.dashboard.view") ? (
          <div className="space-y-5">
            <DashboardStats items={data.stats} />
          </div>
        ) : (
          <div className="font-medium">You don't have permission to view the dashboard.</div>
        )}

        {/* <div className="mt-2 grid sm:grid-cols-1 gap-5">
          <div className="space-y-5">
            <MySubscriptionProducts withCurrentPlan={true} cols="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4" />
            <div>
              <div>
                <div className="flex items-center space-x-2 justify-between">
                  <h3 className="leading-5 text-gray-900">{t("app.dashboard.summary")}</h3>
                </div>

                <dl className="mt-2 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
                  <ProvidersUsage />
                  <ClientsUsage />
                  <EmployeesUsage />
                </dl>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </main>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div>Server Error: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <div>Client Error: {caught.status}</div>;
}

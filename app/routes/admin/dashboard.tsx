import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { AdminLoaderData, loadAdminData } from "~/utils/data/useAdminData";
import { Stat } from "~/application/dtos/stats/Stat";
import { DashboardStats } from "~/components/ui/stats/DashboardStats";
import { SetupItem } from "~/application/dtos/setup/SetupItem";
import { getAdminDashboardStats } from "~/utils/services/adminDashboardService";
import { getSetupSteps } from "~/utils/services/setupService";
import SetupSteps from "~/components/admin/SetupSteps";
import ProfileBanner from "~/components/app/ProfileBanner";

type LoaderData = AdminLoaderData & {
  title: string;
  stats: Stat[];
  setupSteps: SetupItem[];
};

export let loader: LoaderFunction = async ({ request }) => {
  const { t } = await i18nHelper(request);
  const adminData = await loadAdminData(request);

  const stats = await getAdminDashboardStats(30);
  const setupSteps = await getSetupSteps();

  const data: LoaderData = {
    ...adminData,
    title: `${t("app.sidebar.dashboard")} | ${process.env.APP_NAME}`,
    stats,
    setupSteps,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminNavigationRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
      {/*Page header */}
      <div className="hidden md:block bg-white shadow lg:border-t lg:border-gray-200">
        <ProfileBanner user={data.user} />
      </div>

      <div className="px-4 sm:px-8 max-w-5xl mx-auto py-5 grid gap-5">
        <div className="space-y-5">
          <DashboardStats items={data.stats} />

          <SetupSteps items={data.setupSteps} />
        </div>
      </div>
    </main>
  );
}

import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import Tabs, { TabItem } from "~/components/ui/tabs/Tabs";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useEffect, useState } from "react";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("app.navbar.settings")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function SettingsRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const appOrAdminData = useAppOrAdminData();

  const [tabs, setTabs] = useState<TabItem[]>([]);

  useEffect(() => {
    const tabs: TabItem[] = [];
    tabs.push({ name: t("settings.profile.profileTitle"), routePath: UrlUtils.currentTenantUrl(params, "settings/profile") });
    if (getUserHasPermission(appOrAdminData, "app.settings.members.view")) {
      tabs.push({ name: t("settings.members.title"), routePath: UrlUtils.currentTenantUrl(params, "settings/members") });
    }
    if (getUserHasPermission(appOrAdminData, "app.settings.roles.view")) {
      tabs.push({ name: t("models.role.plural"), routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions") });
    }
    tabs.push({ name: t("models.group.plural"), routePath: UrlUtils.currentTenantUrl(params, "settings/groups") });
    if (getUserHasPermission(appOrAdminData, "app.settings.subscription.view")) {
      tabs.push({ name: t("settings.subscription.title"), routePath: UrlUtils.currentTenantUrl(params, `settings/subscription`) });
    }
    if (getUserHasPermission(appOrAdminData, "app.settings.account.view")) {
      tabs.push({ name: t("settings.tenant.title"), routePath: UrlUtils.currentTenantUrl(params, "settings/account") });
    }
    if (getUserHasPermission(appOrAdminData, "app.settings.linkedAccounts.view")) {
      tabs.push({ name: t("models.linkedAccount.plural"), routePath: UrlUtils.currentTenantUrl(params, "settings/linked-accounts") });
    }
    if (getUserHasPermission(appOrAdminData, "app.settings.apiKeys.view")) {
      tabs.push({ name: "API", routePath: UrlUtils.currentTenantUrl(params, "settings/api") });
    }
    if (getUserHasPermission(appOrAdminData, "app.settings.auditTrails.view")) {
      tabs.push({ name: t("models.log.plural"), routePath: UrlUtils.currentTenantUrl(params, "settings/audit-trails") });
    }
    setTabs(tabs);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appOrAdminData, params]);

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === UrlUtils.currentTenantUrl(params, "settings")) {
      navigate(UrlUtils.currentTenantUrl(params, "settings/profile"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2 overflow-auto">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex space-x-3 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} className="flex-grow" breakpoint="xl" />
        </div>
      </div>
      <Outlet />
    </div>
  );
}

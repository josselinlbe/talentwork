import { json, LoaderFunction, MetaFunction, Outlet, redirect, useLocation, useNavigate, useParams } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { useEffect } from "react";
import { getTenantUrl } from "~/utils/services/urlService";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import TabsVertical from "~/components/ui/tabs/TabsVertical";
import { useTranslation } from "react-i18next";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.settings.roles.view", tenantUrl.tenantId);

  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions")) {
    return redirect(UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/roles"));
  }

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminAccountUsersFromTenant() {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions")) {
      navigate(UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/roles"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-2">
          <TabsVertical
            tabs={[
              {
                name: t("models.role.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/roles"),
              },
              {
                name: t("models.permission.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/permissions"),
              },
              {
                name: t("models.user.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/users"),
              },
            ]}
          />
        </div>
        <div className="lg:col-span-10">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

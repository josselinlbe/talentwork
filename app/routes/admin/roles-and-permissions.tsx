import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, Outlet, redirect, useLocation, useNavigate } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { useEffect } from "react";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.roles.view");
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === "/admin/roles-and-permissions") {
    return redirect("/admin/roles-and-permissions/roles");
  }

  let { t } = await i18nHelper(request);

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminRolesRoute() {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin/roles-and-permissions") {
      navigate("/admin/roles-and-permissions/roles");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <IndexPageLayout
      title={t("app.sidebar.rolesAndPermissions")}
      tabs={[
        {
          name: t("models.role.plural"),
          routePath: "/admin/roles-and-permissions/roles",
        },
        {
          name: t("models.permission.plural"),
          routePath: "/admin/roles-and-permissions/permissions",
        },
        {
          name: t("models.role.adminRoles"),
          routePath: "/admin/roles-and-permissions/admin-users",
        },
        {
          name: t("models.role.userRoles"),
          routePath: "/admin/roles-and-permissions/account-users",
        },
      ]}
    >
      <Outlet />
    </IndexPageLayout>
  );
}

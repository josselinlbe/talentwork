import { json, LoaderFunction, MetaFunction, Outlet, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { getAllPermissions, PermissionWithRoles } from "~/utils/db/permissions/permissions.db.server";
import PermissionsTable from "~/components/core/roles/PermissionsTable";
import { useAdminData } from "~/utils/data/useAdminData";

type LoaderData = {
  title: string;
  items: PermissionWithRoles[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const items = await getAllPermissions();

  const data: LoaderData = {
    title: `${t("models.permission.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminRolesRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();

  return (
    <div>
      <PermissionsTable items={data.items} canCreate={adminData.permissions.includes("admin.roles.create")} />
      <Outlet />
    </div>
  );
}

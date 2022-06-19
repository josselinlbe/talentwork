import { json, LoaderFunction, MetaFunction, Outlet, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import RolesTable from "~/components/core/roles/RolesTable";
import { getAllRolesWithUsers, RoleWithPermissionsAndUsers } from "~/utils/db/permissions/roles.db.server";
import { useAdminData } from "~/utils/data/useAdminData";

type LoaderData = {
  title: string;
  items: RoleWithPermissionsAndUsers[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const items = await getAllRolesWithUsers();

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
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
      <RolesTable items={data.items} canCreate={adminData.permissions.includes("admin.roles.create")} />
      <Outlet />
    </div>
  );
}

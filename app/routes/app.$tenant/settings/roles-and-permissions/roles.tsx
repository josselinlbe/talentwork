import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import RolesTable from "~/components/core/roles/RolesTable";
import { getAllRolesWithUsers, RoleWithPermissionsAndUsers } from "~/utils/db/permissions/roles.db.server";
import { useAppData } from "~/utils/data/useAppData";

type LoaderData = {
  title: string;
  items: RoleWithPermissionsAndUsers[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const items = await getAllRolesWithUsers("app");

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function RolesRoute() {
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();

  return (
    <div>
      <RolesTable items={data.items} canCreate={false} canUpdate={false} tenantId={appData.currentTenant.id} />
    </div>
  );
}

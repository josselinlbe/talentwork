import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import { getAllPermissions, PermissionWithRoles } from "~/utils/db/permissions/permissions.db.server";
import PermissionsTable from "~/components/core/roles/PermissionsTable";
import { useAppData } from "~/utils/data/useAppData";

type LoaderData = {
  title: string;
  items: PermissionWithRoles[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const items = await getAllPermissions("app");

  const data: LoaderData = {
    title: `${t("models.permission.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function PermissionsRoute() {
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();

  return (
    <div>
      <PermissionsTable items={data.items} canCreate={false} canUpdate={false} tenantId={appData.currentTenant.id} />
    </div>
  );
}

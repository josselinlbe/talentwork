import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import RolesTable from "~/components/core/roles/RolesTable";
import { getAllRolesWithUsers, RoleWithPermissionsAndUsers } from "~/utils/db/permissions/roles.db.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { getFiltersFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import InputFilters from "~/components/ui/input/InputFilters";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";
import { getAllPermissions } from "~/utils/db/permissions/permissions.db.server";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";

type LoaderData = {
  title: string;
  items: RoleWithPermissionsAndUsers[];
  filterableProperties: FilterablePropertyDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "name", title: "models.role.name" },
    { name: "description", title: "models.role.description" },
    {
      name: "permissionId",
      title: "models.permission.object",
      manual: true,
      options: (await getAllPermissions()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const items = await getAllRolesWithUsers(undefined, filters);

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
    items,
    filterableProperties,
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
    <div className="space-y-2">
      <div className="flex space-x-2">
        <div className="flex-grow">
          <InputSearchWithURL />
        </div>
        <InputFilters filters={data.filterableProperties} />
        <ButtonPrimary to="new">
          <div className="sm:text-sm">+</div>
        </ButtonPrimary>
      </div>
      {/* <InputSearchWithURL onNewRoute={adminData.permissions.includes("admin.roles.create") ? "new" : undefined} /> */}
      <RolesTable items={data.items} canUpdate={adminData.permissions.includes("admin.roles.update")} />
      <Outlet />
    </div>
  );
}

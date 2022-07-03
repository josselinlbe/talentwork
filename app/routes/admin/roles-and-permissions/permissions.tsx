import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import { getAllPermissions, PermissionWithRoles } from "~/utils/db/permissions/permissions.db.server";
import PermissionsTable from "~/components/core/roles/PermissionsTable";
import { useAdminData } from "~/utils/data/useAdminData";
import { getFiltersFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getAllRoles } from "~/utils/db/permissions/roles.db.server";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";
import InputFilters from "~/components/ui/input/InputFilters";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";

type LoaderData = {
  title: string;
  items: PermissionWithRoles[];
  filterableProperties: FilterablePropertyDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "name", title: "models.role.name" },
    { name: "description", title: "models.role.description" },
    {
      name: "roleId",
      title: "models.role.object",
      manual: true,
      options: (await getAllRoles()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const items = await getAllPermissions(undefined, filters);

  const data: LoaderData = {
    title: `${t("models.permission.plural")} | ${process.env.APP_NAME}`,
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
      <PermissionsTable
        items={data.items}
        canCreate={adminData.permissions.includes("admin.roles.create")}
        canUpdate={adminData.permissions.includes("admin.roles.update")}
      />
      <Outlet />
    </div>
  );
}

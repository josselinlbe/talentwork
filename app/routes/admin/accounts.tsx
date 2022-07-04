import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { adminGetAllTenantsWithUsage, TenantWithUsage } from "~/utils/db/tenants.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import TenantsTable from "~/components/core/tenants/TenantsTable";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getFiltersFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import InputFilters from "~/components/ui/input/InputFilters";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { adminGetAllUsers } from "~/utils/db/users.db.server";

type LoaderData = {
  title: string;
  items: TenantWithUsage[];
  filterableProperties: FilterablePropertyDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.accounts.view");
  let { t } = await i18nHelper(request);

  const filterableProperties = [
    { name: "name", title: "models.tenant.name" },
    { name: "slug", title: "models.tenant.slug" },
    {
      name: "userId",
      title: "models.user.object",
      manual: true,
      options: (await adminGetAllUsers()).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const items = (await adminGetAllTenantsWithUsage(filters)).sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const data: LoaderData = {
    title: `${t("models.tenant.plural")} | ${process.env.APP_NAME}`,
    items,
    filterableProperties,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminTenantsRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">
            {t("models.tenant.plural")}
            <span className="ml-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-800 border border-gray-300">
              {data.items.length}
            </span>
          </h1>
          <div className="flex items-center space-x-2 h-9">
            <InputFilters filters={data.filterableProperties} />
          </div>
        </div>
      </div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        <TenantsTable items={data.items} withSearch={false} />
      </div>
    </div>
  );
}

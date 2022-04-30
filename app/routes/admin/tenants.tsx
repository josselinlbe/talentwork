import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { adminGetAllTenants, TenantWithDetails } from "~/utils/db/tenants.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { loadTenantsSubscriptionAndUsage } from "~/utils/services/tenantsService";
import TenantsTable from "~/components/core/tenants/TenantsTable";
import TenantsTableWithReactTable from "~/components/core/tenants/TenantsTableWithReactTable";

type LoaderData = {
  title: string;
  items: TenantWithDetails[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);
  const items = await adminGetAllTenants();
  await loadTenantsSubscriptionAndUsage(items);

  const data: LoaderData = {
    title: `${t("models.tenant.plural")} | ${process.env.APP_NAME}`,
    items,
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
            <ButtonSecondary to="." type="button">
              {t("shared.reload")}
            </ButtonSecondary>
          </div>
        </div>
      </div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        <TenantsTable items={data.items} withSearch={true} />

        <h1 className="flex-1 font-bold flex items-center truncate">Tenants - React Table</h1>

        <TenantsTableWithReactTable items={data.items} withSearch={true} />
      </div>
    </div>
  );
}

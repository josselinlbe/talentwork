import { ContractStatusFilter } from "~/modules/contracts/enums/ContractStatusFilter";
import ContractsList from "~/modules/contracts/components/contracts/ContractsList";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import Tabs from "~/components/ui/tabs/Tabs";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, redirect, useLoaderData, useParams } from "remix";
import { getContracts } from "~/modules/contracts/db/contracts.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppData } from "~/utils/data/useAppData";

type LoaderData = {
  title: string;
  items: Awaited<ReturnType<typeof getContracts>>;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.entity.contract.view", tenantUrl.tenantId);

  const url = new URL(request.url);
  const filterString = url.searchParams.get("status");
  let filter: ContractStatusFilter | undefined;
  if (filterString === "pending") {
    filter = ContractStatusFilter.PENDING;
  } else if (filterString === "all") {
    filter = ContractStatusFilter.ALL;
  } else if (filterString === "archived") {
    filter = ContractStatusFilter.ARCHIVED;
  } else if (filterString === "signed") {
    filter = ContractStatusFilter.SIGNED;
  } else {
    throw redirect(UrlUtils.currentTenantUrl(params, "contracts?status=pending"));
  }
  const items = await getContracts(tenantUrl.tenantId, filter);
  const data: LoaderData = {
    title: `${t("models.contract.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function ContractsRoute() {
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();
  const params = useParams();
  const { t } = useTranslation();

  const tabs = [
    {
      name: t("shared.all"),
      routePath: UrlUtils.currentTenantUrl(params, "contracts?status=all"),
    },
    {
      name: t("app.contracts.pending.title"),
      routePath: UrlUtils.currentTenantUrl(params, "contracts?status=pending"),
    },
    {
      name: t("app.contracts.signed.title"),
      routePath: UrlUtils.currentTenantUrl(params, "contracts?status=signed"),
    },
    {
      name: t("app.contracts.archived.title"),
      routePath: UrlUtils.currentTenantUrl(params, "contracts?status=archived"),
    },
  ];

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("models.contract.plural")}</h1>
          <div className="flex items-center">
            <ButtonPrimary disabled={!appData.permissions.includes("app.entity.contract.create")} to={UrlUtils.currentTenantUrl(params, "contracts/new")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden lg:block">{t("app.contracts.new.title")}</span>
              <span className="lg:hidden">{t("shared.new")}</span>
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <Tabs tabs={tabs} className="flex-grow" />
        </div>
      </div>
      <div className="pt-2 space-y-2 max-w-5xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContractsList items={data.items} />
      </div>
    </div>
  );
}

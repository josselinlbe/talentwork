import { useTranslation } from "react-i18next";
import { json, Link, LoaderFunction, MetaFunction, useLoaderData, useParams } from "remix";
import { getTenantRelationships, TenantRelationshipWithDetails } from "~/utils/db/tenantRelationships.db.server";
import { TenantRelationshipStatus } from "~/application/enums/tenants/TenantRelationshipStatus";
import { useState } from "react";
import { i18nHelper } from "~/locale/i18n.utils";
import TenantRelationshipsTable from "~/components/app/tenantRelationships/TenantRelationshipsTable";
import { getTenantUrl } from "~/utils/services/urlService";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  title: string;
  items: TenantRelationshipWithDetails[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const items = await getTenantRelationships(tenantUrl.tenantId, TenantRelationshipStatus.LINKED);
  const data: LoaderData = {
    title: `${t("models.tenantRelationship.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AllLinksRoute() {
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (f) =>
        f.clientTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.providerTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };
  return (
    <div>
      <div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center justify-between w-full space-x-2">
              <div className="relative flex items-center flex-grow">
                <div className="focus-within:z-10 absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="buscador"
                  id="buscador"
                  className="w-full focus:ring-theme-500 focus:border-theme-500 block rounded-md pl-10 sm:text-sm border-gray-300"
                  placeholder={t("shared.searchDot")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Link
                to={UrlUtils.currentTenantUrl(params, "settings/tenant-relationships/new")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 lg:-ml-0.5 h-5 w-5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>

                <div>{t("app.tenantRelationships.new")}</div>
              </Link>
            </div>
          </div>
          <TenantRelationshipsTable items={filteredItems()} />
        </div>
      </div>
    </div>
  );
}

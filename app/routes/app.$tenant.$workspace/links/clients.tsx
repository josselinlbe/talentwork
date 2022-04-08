import { useTranslation } from "react-i18next";
import { useState } from "react";
import ClientsListAndTable from "~/components/app/links/clients/ClientsListAndTable";
import { getClientLinks, LinkWithWorkspacesAndContracts } from "~/utils/db/links.db.server";
import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  title: string;
  items: LinkWithWorkspacesAndContracts[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const items = await getClientLinks(tenantUrl.workspaceId);
  const data: LoaderData = {
    title: `${t("models.client.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function ClientsRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter((f) => f.clientWorkspace.name?.toString().toUpperCase().includes(searchInput.toUpperCase()));
  };

  return (
    <div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="flex items-center justify-start w-full">
            <div className="relative flex items-center w-full">
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
          </div>
        </div>
        <ClientsListAndTable items={filteredItems()} />
      </div>
    </div>
  );
}

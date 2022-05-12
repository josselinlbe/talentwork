import { useTranslation } from "react-i18next";
import { json, Link, LoaderFunction, MetaFunction, useLoaderData, useNavigate, useParams } from "remix";
import { getLinkedAccounts, LinkedAccountWithDetails } from "~/utils/db/linkedAccounts.db.server";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { useState } from "react";
import { i18nHelper } from "~/locale/i18n.utils";
import LinkedAccountsTable from "~/components/app/linkedAccounts/LinkedAccountsTable";
import { getTenantUrl } from "~/utils/services/urlService";
import UrlUtils from "~/utils/app/UrlUtils";
import InputSearch from "~/components/ui/input/InputSearch";

type LoaderData = {
  title: string;
  items: LinkedAccountWithDetails[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const items = await getLinkedAccounts(tenantUrl.tenantId, LinkedAccountStatus.LINKED);
  const data: LoaderData = {
    title: `${t("models.linkedAccount.plural")} | ${process.env.APP_NAME}`,
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
  const navigate = useNavigate();

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
          <InputSearch
            value={searchInput}
            setValue={setSearchInput}
            onNew={() => navigate(UrlUtils.currentTenantUrl(params, "settings/linked-accounts/new"))}
          />
          <LinkedAccountsTable items={filteredItems()} />
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, Outlet, redirect, useLoaderData } from "remix";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { ApiKeyWithDetails, deleteApiKey, getAllApiKeys, getApiKeyById, updateApiKey } from "~/utils/db/apiKeys.db.server";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  apiKeys: ApiKeyWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const apiKeys = await getAllApiKeys();
  const data: LoaderData = {
    apiKeys,
  };
  return json(data);
};

export default function AdminApiKeysRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const adminData = useAdminData();
  return (
    <>
      <ApiKeysTable entities={adminData.entities} items={data.apiKeys} withTenant={true} />
      <Outlet />
    </>
  );
}

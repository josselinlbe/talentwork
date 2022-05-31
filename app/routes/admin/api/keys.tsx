import { json, LoaderFunction, Outlet, useLoaderData } from "remix";
import ApiKeysTable from "~/components/core/apiKeys/ApiKeysTable";
import { useAdminData } from "~/utils/data/useAdminData";
import { ApiKeyWithDetails, getAllApiKeys } from "~/utils/db/apiKeys.db.server";

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
  const adminData = useAdminData();
  return (
    <>
      <ApiKeysTable entities={adminData.entities} items={data.apiKeys} withTenant={true} />
      <Outlet />
    </>
  );
}

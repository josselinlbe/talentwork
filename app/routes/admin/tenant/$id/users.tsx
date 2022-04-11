import { json, LoaderFunction, MetaFunction, useLoaderData, useParams } from "remix";
import TenantProfile from "~/components/core/tenants/TenantProfile";
import UsersTable from "~/components/core/users/UsersTable";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminTenantData } from "~/utils/data/useAdminTenantData";
import { adminGetAllTenantUsers, adminGetAllUsers } from "~/utils/db/users.db.server";

type LoaderData = {
  title: string;
  items: Awaited<ReturnType<typeof adminGetAllUsers>>;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const items = await adminGetAllTenantUsers(params.id ?? "");
  const data: LoaderData = {
    title: `${t("models.user.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function AdminTenantUsersRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <UsersTable items={data.items} />
    </>
  );
}

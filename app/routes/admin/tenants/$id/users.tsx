import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import UsersTable from "~/components/core/users/UsersTable";
import { i18nHelper } from "~/locale/i18n.utils";
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
  title: data?.title,
});

export default function AdminTenantUsersRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
      <UsersTable items={data.items} />
    </div>
  );
}

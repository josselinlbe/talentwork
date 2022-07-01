import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { adminGetAllTenants, TenantWithDetails } from "~/utils/db/tenants.db.server";
import { useTranslation } from "react-i18next";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useState } from "react";
import InputSearch from "~/components/ui/input/InputSearch";

type LoaderData = {
  title: string;
  tenants: TenantWithDetails[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const tenants = await adminGetAllTenants();

  const data: LoaderData = {
    title: `${t("models.permission.userRoles")} | ${process.env.APP_NAME}`,
    tenants,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminRolesAndPermissionsAccountUsersRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.tenants) {
      return [];
    }
    return data.tenants.filter(
      (f) =>
        f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.users.find(
          (x) =>
            x.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.user.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.user.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <TableSimple
        items={filteredItems()}
        headers={[
          {
            name: "tenant",
            title: t("models.tenant.object"),
            value: (i) => i.name,
          },
          {
            name: "users",
            title: t("models.user.plural"),
            value: (i) => i.users.length,
            formattedValue: (i) => (
              <div className=" max-w-xl w-full truncate">{i.users.map((f) => `${f.user.firstName} ${f.user.lastName} (${f.user.email})`).join(", ")}</div>
            ),
          },
        ]}
        actions={[
          {
            title: t("shared.setUserRoles"),
            onClickRoute: (_, item) => `${item.id}`,
          },
        ]}
      />
    </div>
  );
}

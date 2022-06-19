import { json, LoaderFunction, MetaFunction, Outlet, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserPermission } from "~/utils/helpers/PermissionsHelper";
import { getTenantUrl } from "~/utils/services/urlService";
import { getAllGroups, getMyGroups, GroupWithDetails } from "~/utils/db/permissions/groups.db.server";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useTranslation } from "react-i18next";
import GroupBadge from "~/components/core/roles/GroupBadge";
import InputSearch from "~/components/ui/input/InputSearch";
import { useState } from "react";

type LoaderData = {
  title: string;
  items: GroupWithDetails[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const { permission, userPermission } = await getUserPermission(request, "app.settings.groups.full", tenantUrl.tenantId);
  let items: GroupWithDetails[];
  if (!permission || userPermission) {
    items = await getAllGroups(tenantUrl.tenantId);
  } else {
    items = await getMyGroups(tenantUrl.tenantId);
  }

  const data: LoaderData = {
    title: `${t("models.group.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function RolesRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (f) =>
        f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.description?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.users.find(
          (f) =>
            f.user.email.toUpperCase().includes(searchInput.toUpperCase()) ||
            f.user.firstName.toUpperCase().includes(searchInput.toUpperCase()) ||
            f.user.lastName.toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  return (
    <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
      <InputSearch value={searchInput} setValue={setSearchInput} onNewRoute={"new"} />
      <TableSimple
        items={filteredItems()}
        headers={[
          {
            name: "name",
            title: t("models.group.name"),
            value: (i) => i.name,
            formattedValue: (i) => <GroupBadge item={i} />,
          },
          {
            name: "description",
            title: t("models.group.description"),
            value: (i) => i.description,
          },
          {
            name: "users",
            title: t("models.user.plural"),
            value: (i) => i.users.map((f) => `${f.user.firstName} ${f.user.lastName}`).join(", "),
            className: "w-full",
          },
        ]}
        actions={[
          {
            title: t("shared.edit"),
            onClickRoute: (_, i) => i.id,
          },
        ]}
      />
      <Outlet />
    </div>
  );
}

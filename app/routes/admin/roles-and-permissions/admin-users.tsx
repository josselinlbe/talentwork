import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import { getAllRoles, getRole } from "~/utils/db/permissions/roles.db.server";
import { adminGetAllUsers, getUser, UserWithDetails } from "~/utils/db/users.db.server";
import UserRolesTable from "~/components/core/roles/UserRolesTable";
import { Role } from "@prisma/client";
import { useState } from "react";
import InputSearch from "~/components/ui/input/InputSearch";
import { createUserRole, deleteUserRole } from "~/utils/db/permissions/userRoles.db.server";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { useAdminData } from "~/utils/data/useAdminData";

type LoaderData = {
  title: string;
  items: UserWithDetails[];
  roles: Role[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const items = (await adminGetAllUsers()).filter((f) => f.admin);
  const roles = await getAllRoles("admin");

  const data: LoaderData = {
    title: `${t("models.role.adminRoles")} | ${process.env.APP_NAME}`,
    items,
    roles,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  items?: UserWithDetails[];
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const userId = form.get("user-id")?.toString() ?? "";
    const roleId = form.get("role-id")?.toString() ?? "";
    const add = form.get("add") === "true";

    const user = await getUser(userId);
    const role = await getRole(roleId);

    if (add) {
      await createUserRole(userId, roleId);
      createAdminLog(request, "Created", `${user?.email} - ${role?.name}}`);
    } else {
      await deleteUserRole(userId, roleId);
      createAdminLog(request, "Deleted", `${user?.email} - ${role?.name}}`);
    }
    const actionData: ActionData = {
      items: await adminGetAllUsers(),
    };
    return json(actionData);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminRolesAndPermissionsAdminUsersRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useLoaderData<ActionData>();
  const adminData = useAdminData();
  const [items] = useState(actionData.items ?? data.items);
  const submit = useSubmit();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.tenants.find((f) => f.tenant.name.toUpperCase().includes(searchInput.toUpperCase())) ||
        f.roles.find(
          (f) => f.role.name.toUpperCase().includes(searchInput.toUpperCase()) || f.role.description.toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  function onChange(item: UserWithDetails, role: Role, add: any) {
    const form = new FormData();
    form.set("action", "edit");
    form.set("user-id", item.id);
    form.set("role-id", role.id);
    form.set("add", add ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <UserRolesTable items={filteredItems()} roles={data.roles} onChange={onChange} disabled={!adminData.permissions.includes("admin.roles.set")} />
    </div>
  );
}

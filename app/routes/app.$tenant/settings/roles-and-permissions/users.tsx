import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import { getAllRoles, getRole } from "~/utils/db/permissions/roles.db.server";
import { adminGetAllTenantUsers, adminGetAllUsers, getUser, UserWithDetails } from "~/utils/db/users.db.server";
import UserRolesTable from "~/components/core/roles/UserRolesTable";
import { Role } from "@prisma/client";
import { useState } from "react";
import InputSearch from "~/components/ui/input/InputSearch";
import { createUserRole, deleteUserRole } from "~/utils/db/permissions/userRoles.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { getTenantUrl } from "~/utils/services/urlService";
import { useAppData } from "~/utils/data/useAppData";
import { createRoleAssignedEvent } from "~/utils/services/events/rolesEventsService";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  title: string;
  items: UserWithDetails[];
  roles: Role[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const tenantUsers = await adminGetAllTenantUsers(tenantUrl.tenantId);
  const roles = await getAllRoles("app");

  const items: UserWithDetails[] = [];
  tenantUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user);
    }
  });

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
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);
  const fromUser = await getUser(userInfo.userId);
  if (!fromUser) {
    return badRequest({ error: "Invalid user" });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const userId = form.get("user-id")?.toString() ?? "";
    const roleId = form.get("role-id")?.toString() ?? "";
    const add = form.get("add") === "true";

    const tenant = await getTenant(tenantUrl.tenantId);
    const user = await getUser(userId);
    const role = await getRole(roleId);

    if (add) {
      await createUserRole(userId, roleId, tenantUrl.tenantId);
      if (fromUser && user && role) {
        await createRoleAssignedEvent(tenantUrl.tenantId, {
          fromUser: { id: fromUser.id, email: fromUser.email },
          toUser: { id: user.id, email: user.email },
          role: { id: role.id, name: role.name, description: role.description },
        });
      }
      createAdminLog(request, "Created", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    } else {
      await deleteUserRole(userId, roleId, tenantUrl.tenantId);
      createAdminLog(request, "Deleted", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    }

    const actionData: ActionData = {
      items: (await adminGetAllUsers()).items,
    };
    return json(actionData);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminAccountUsersFromTenant() {
  const data = useLoaderData<LoaderData>();
  const actionData = useLoaderData<ActionData>();
  const appData = useAppData();
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
    <div>
      <InputSearch value={searchInput} setValue={setSearchInput} />

      <UserRolesTable
        items={filteredItems()}
        roles={data.roles}
        onChange={onChange}
        tenantId={appData.currentTenant.id}
        disabled={!appData.permissions.includes("app.settings.roles.set")}
      />
    </div>
  );
}

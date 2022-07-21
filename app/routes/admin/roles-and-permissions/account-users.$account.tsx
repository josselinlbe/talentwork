import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import { getAllRoles, getRole } from "~/utils/db/permissions/roles.db.server";
import { adminGetAllTenantUsers, adminGetAllUsers, getUser, UserWithDetails } from "~/utils/db/users.db.server";
import UserRolesTable from "~/components/core/roles/UserRolesTable";
import { Role, Tenant } from "@prisma/client";
import { useState } from "react";
import InputSearch from "~/components/ui/input/InputSearch";
import { createUserRole, deleteUserRole } from "~/utils/db/permissions/userRoles.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { createAdminLog } from "~/utils/db/logs.db.server";
import BreadcrumbSimple from "~/components/ui/breadcrumbs/BreadcrumbSimple";
import { useAdminData } from "~/utils/data/useAdminData";

type LoaderData = {
  title: string;
  tenant: Tenant;
  items: UserWithDetails[];
  roles: Role[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const tenant = await getTenant(params.account);
  if (!tenant) {
    return redirect("/admin/roles-and-permissions/account-users");
  }

  const adminUsers = (await adminGetAllUsers()).items.filter((f) => f.admin);
  const tenantUsers = await adminGetAllTenantUsers(params.account ?? "");
  const roles = await getAllRoles("app");

  const items: UserWithDetails[] = [];
  adminUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user);
    }
  });
  tenantUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user);
    }
  });

  const data: LoaderData = {
    title: `${t("models.role.adminRoles")} | ${process.env.APP_NAME}`,
    items,
    roles,
    tenant,
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

    const tenant = await getTenant(params.account ?? "");
    const user = await getUser(userId);
    const role = await getRole(roleId);

    if (add) {
      await createUserRole(userId, roleId, params.account);
      createAdminLog(request, "Created", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    } else {
      await deleteUserRole(userId, roleId, params.account);
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
  const adminData = useAdminData();
  const [items] = useState(actionData.items ?? data.items);
  const submit = useSubmit();
  const params = useParams();

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
      <BreadcrumbSimple
        home="/admin"
        menu={[
          {
            title: "App Users",
            routePath: "/admin/roles-and-permissions/account-users",
          },
          {
            title: data.tenant.name,
            routePath: "/admin/roles-and-permissions/account-users/" + data.tenant.id,
          },
        ]}
      />
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <UserRolesTable
        items={filteredItems()}
        roles={data.roles}
        onChange={onChange}
        tenantId={params.account ?? ""}
        disabled={!adminData.permissions.includes("admin.roles.set")}
      />
    </div>
  );
}

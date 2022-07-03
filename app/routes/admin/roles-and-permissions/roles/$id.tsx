import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import RoleForm from "~/components/core/roles/RoleForm";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { getAllPermissions, PermissionWithRoles } from "~/utils/db/permissions/permissions.db.server";
import { setRolePermissions } from "~/utils/db/permissions/rolePermissions.db.server";
import { deleteRole, getRole, RoleWithPermissions, updateRole } from "~/utils/db/permissions/roles.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  item: RoleWithPermissions;
  permissions: PermissionWithRoles[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const item = await getRole(params.id ?? "");
  if (!item) {
    throw redirect("/admin/roles-and-permissions/roles");
  }
  const permissions = await getAllPermissions();
  const data: LoaderData = {
    title: `${item.name} | ${t("models.role.object")} | ${process.env.APP_NAME}`,
    item,
    permissions,
  };
  return json(data);
};

export type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const existing = await getRole(params.id ?? "");
  if (!existing) {
    return redirect("/admin/roles-and-permissions/roles");
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.roles.update");
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const assignToNewUsers = Boolean(form.get("assign-to-new-users"));
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const permissions = form.getAll("permissions[]").map((f) => f.toString());
    const data = {
      name,
      description,
      assignToNewUsers,
      type,
    };
    await updateRole(existing.id, data);
    await setRolePermissions(existing.id, permissions);
    createAdminLog(
      request,
      "Updated",
      `${existing.name}: ${JSON.stringify({
        ...data,
        permissions,
      })}`
    );
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.roles.delete");
    await deleteRole(existing.id);
    createAdminLog(request, "Deleted", `${existing.name}`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect("/admin/roles-and-permissions/roles");
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminEditRoleRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  const navigate = useNavigate();
  function goBack() {
    navigate("/admin/roles-and-permissions/roles");
  }
  return (
    <SlideOverFormLayout title={data.item.name} description={data.item.description} onClosed={goBack}>
      <RoleForm
        item={data.item}
        permissions={data.permissions}
        onCancel={goBack}
        canUpdate={adminData.permissions.includes("admin.roles.update")}
        canDelete={adminData.permissions.includes("admin.roles.delete")}
      />
    </SlideOverFormLayout>
  );
}

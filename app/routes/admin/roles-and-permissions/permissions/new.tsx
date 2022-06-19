import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useLoaderData, useNavigate } from "remix";
import PermissionForm from "~/components/core/roles/PermissionForm";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { createPermission, getNextPermissionsOrder, getPermissionByName } from "~/utils/db/permissions/permissions.db.server";
import { setPermissionRoles } from "~/utils/db/permissions/rolePermissions.db.server";
import { getAllRoles, RoleWithPermissions } from "~/utils/db/permissions/roles.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  roles: RoleWithPermissions[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  await verifyUserHasPermission(request, "admin.roles.create");
  let { t } = await i18nHelper(request);

  const roles = await getAllRoles();
  const data: LoaderData = {
    title: `${t("models.permission.object")} | ${process.env.APP_NAME}`,
    roles,
  };
  return json(data);
};

export type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const roles = form.getAll("roles[]").map((f) => f.toString());

    const existing = await getPermissionByName(name);
    if (existing) {
      return badRequest({ error: "Existing permission with name: " + name });
    }

    const order = await getNextPermissionsOrder(type);
    const data = {
      order,
      name,
      description,
      type,
      isDefault: false,
    };
    const permission = await createPermission(data);
    await setPermissionRoles(permission.id, roles);
    createAdminLog(
      request,
      "Created",
      `${JSON.stringify({
        ...data,
        roles,
      })}`
    );
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect("/admin/roles-and-permissions/permissions");
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminEditPermissionRoute() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  function goBack() {
    navigate("/admin/roles-and-permissions/permissions");
  }
  return (
    <SlideOverFormLayout title={"New Permission"} description="" onClosed={goBack}>
      <PermissionForm roles={data.roles} onCancel={goBack} />
    </SlideOverFormLayout>
  );
}

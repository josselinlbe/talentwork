import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useLoaderData, useNavigate, useParams } from "remix";
import GroupForm from "~/components/core/roles/GroupForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppData } from "~/utils/data/useAppData";
import { createLog } from "~/utils/db/logs.db.server";
import { deleteGroup, getGroup, GroupWithDetails, updateGroup } from "~/utils/db/permissions/groups.db.server";
import { createUserGroup, deleteGroupUsers } from "~/utils/db/permissions/userGroups.db.server";
import { getTenantUsers, TenantUserWithUser } from "~/utils/db/tenants.db.server";
import { getUsersById } from "~/utils/db/users.db.server";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  title: string;
  item: GroupWithDetails;
  tenantUsers: TenantUserWithUser[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const item = await getGroup(params.id ?? "");
  if (!item) {
    throw redirect(UrlUtils.currentTenantUrl(params, "settings/groups"));
  }
  const data: LoaderData = {
    title: `${item.name} | ${t("models.group.object")} | ${process.env.APP_NAME}`,
    item,
    tenantUsers: await getTenantUsers(tenantUrl.tenantId),
  };
  return json(data);
};

export type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const existing = await getGroup(params.id ?? "");
  if (!existing) {
    throw redirect(UrlUtils.currentTenantUrl(params, "settings/groups"));
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const data = {
      tenantId: tenantUrl.tenantId,
      name: form.get("name")?.toString() ?? "",
      description: form.get("description")?.toString() ?? "",
      color: Number(form.get("color")),
    };
    await updateGroup(existing.id, data);
    await deleteGroupUsers(existing.id);
    const userIds = form.getAll("users[]").map((f) => f.toString());
    const users = await getUsersById(userIds);
    await Promise.all(
      users.map(async (user) => {
        return await createUserGroup(user.id, existing.id);
      })
    );
    createLog(request, tenantUrl, "Updated", `${existing.name}: ${JSON.stringify({ ...data, users: users.map((f) => f.email) })}`);
  } else if (action === "delete") {
    await deleteGroup(existing.id);
    createLog(request, tenantUrl, "Deleted", `${existing.name}`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect(UrlUtils.currentTenantUrl(params, "settings/groups"));
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminEditGroupRoute() {
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <OpenModal className="sm:max-w-sm" onClose={() => navigate(UrlUtils.currentTenantUrl(params, "settings/groups"))}>
      <GroupForm
        allUsers={data.tenantUsers}
        item={data.item}
        canUpdate={appData.permissions.includes("app.settings.groups.full") || data.item.createdByUserId === appData.user.id}
        canDelete={appData.permissions.includes("app.settings.groups.full") || data.item.createdByUserId === appData.user.id}
      />
    </OpenModal>
  );
}

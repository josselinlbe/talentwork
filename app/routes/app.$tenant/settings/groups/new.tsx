import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import GroupForm from "~/components/core/roles/GroupForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { createLog } from "~/utils/db/logs.db.server";
import { createGroup } from "~/utils/db/permissions/groups.db.server";
import { createUserGroup } from "~/utils/db/permissions/userGroups.db.server";
import { getTenantUsers, TenantUserWithUser } from "~/utils/db/tenants.db.server";
import { getUsersById } from "~/utils/db/users.db.server";
import { getTenantUrl } from "~/utils/services/urlService";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  tenantUsers: TenantUserWithUser[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  const data: LoaderData = {
    tenantUsers: await getTenantUsers(tenantUrl.tenantId),
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const data = {
      createdByUserId: userInfo.userId,
      tenantId: tenantUrl.tenantId,
      name: form.get("name")?.toString() ?? "",
      description: form.get("description")?.toString() ?? "",
      color: Number(form.get("color")),
    };
    const group = await createGroup(data);
    const userIds = form.getAll("users[]").map((f) => f.toString());
    const users = await getUsersById(userIds);
    await Promise.all(
      users.map(async (user) => {
        return await createUserGroup(user.id, group.id);
      })
    );
    createLog(
      request,
      tenantUrl,
      "Created",
      `${JSON.stringify({
        ...data,
        users: users.map((f) => f.email),
      })}`
    );
    return redirect(UrlUtils.currentTenantUrl(params, "settings/groups"));
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function NewGroupRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <OpenModal className="sm:max-w-sm" onClose={() => navigate(UrlUtils.currentTenantUrl(params, "settings/groups"))}>
        <GroupForm allUsers={data.tenantUsers} />
      </OpenModal>
    </>
  );
}

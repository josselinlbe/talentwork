import { json, redirect } from "@remix-run/node";
import { i18nHelper } from "~/locale/i18n.utils";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getRow, setRowPermissions } from "~/utils/db/entities/rows.db.server";
import { createManualLog } from "~/utils/db/logs.db.server";
import { getGroups } from "~/utils/db/permissions/groups.db.server";
import { getRoles } from "~/utils/db/permissions/roles.db.server";
import { deleteRowPermission, createRowPermission } from "~/utils/db/permissions/rowPermissions.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getUsersById } from "~/utils/db/users.db.server";
import { Params } from "react-router";
import { getUserInfo } from "~/utils/session.server";
import UrlUtils from "~/utils/app/UrlUtils";

export type ActionDataRowShare = {
  error?: string;
};
const badRequest = (data: ActionDataRowShare) => json(data, { status: 400 });
export const actionRowShare = async (
  request: Request,
  params: Params,
  tenantId: string | null,
  entitySlug: string,
  entityRowsRoute: string,
  rowId?: string
) => {
  let { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);

  const entity = await getEntityBySlug(entitySlug);
  if (!entity) {
    return redirect(entityRowsRoute);
  }
  const item = await getRow(entity.id, rowId ?? params.id ?? "", tenantId);
  if (!item) {
    return redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
  }

  const form = await request.formData();
  const visibility = form.get("visibility")?.toString() ?? "";
  let canComment = Boolean(form.get("can-comment"));
  let canUpdate = Boolean(form.get("can-update"));
  let canDelete = Boolean(form.get("can-delete"));

  const userIds = form.getAll("users[]").map((f) => f.toString());
  const groupIds = form.getAll("groups[]").map((f) => f.toString());
  const roleIds = form.getAll("roles[]").map((f) => f.toString());

  await deleteRowPermission(item.id);
  if (visibility === "private") {
    canComment = canUpdate = canDelete = true;
  }
  await setRowPermissions(item.id, {
    visibility,
    canComment,
    canUpdate,
    canDelete,
  });
  if (visibility === "public") {
    createManualLog(userInfo.userId, tenantId, new URL(request.url).pathname, "Shared to: Public", "");
  } else if (visibility === "tenant") {
    await createRowPermission({
      rowId: item.id,
      tenantId: tenantId,
    });
    const tenant = await getTenant(tenantId ?? "");
    createManualLog(userInfo.userId, tenantId, new URL(request.url).pathname, "Shared to: Tenant", tenant?.name ?? tenantId ?? "");
  } else if (visibility === "roles") {
    const roles = await getRoles(roleIds);
    roles.map(async (role) => {
      await createRowPermission({
        rowId: item.id,
        roleId: role.id,
      });
    });
    createManualLog(userInfo.userId, tenantId, new URL(request.url).pathname, "Shared to: Roles", roles.map((f) => f.name).join(", "));
  } else if (visibility === "groups") {
    const groups = await getGroups(tenantId, groupIds);
    groups.map(async (group) => {
      await createRowPermission({
        rowId: item.id,
        groupId: group.id,
      });
    });
    createManualLog(userInfo.userId, tenantId, new URL(request.url).pathname, "Shared to: Groups", groups.map((f) => f.name).join(", "));
  } else if (visibility === "users") {
    const users = await getUsersById(userIds);
    users.map(async (user) => {
      await createRowPermission({
        rowId: item.id,
        userId: user.id,
      });
    });
    createManualLog(userInfo.userId, tenantId, new URL(request.url).pathname, "Shared to: Users", users.map((f) => f.email).join(", "));
  } else if (visibility === "private") {
    createManualLog(userInfo.userId, tenantId, new URL(request.url).pathname, "Set Private", "");
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }

  return redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
};

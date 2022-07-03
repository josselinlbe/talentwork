import { RowPermission } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getRow } from "~/utils/db/entities/rows.db.server";
import { getRowPermissions } from "~/utils/db/permissions/rowPermissions.db.server";
import { getUserRoles } from "~/utils/db/permissions/userRoles.db.server";
import { verifyUserHasPermission, getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import { getUserInfo } from "~/utils/session.server";
import { Params } from "react-router";
import UrlUtils from "~/utils/app/UrlUtils";
import { getUsersByTenant, UserWithDetails } from "~/utils/db/users.db.server";

export type LoaderDataRowShare = {
  title: string;
  entity: EntityWithDetails;
  item: any;
  rowPermissions: RowPermission[];
  users: UserWithDetails[];
  publicUrl: string;
  entityRowsRoute: string;
};
export let loaderRowShare = async (request: Request, params: Params, tenantId: string | null, entitySlug: string, entityRowsRoute: string, rowId?: string) => {
  let { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);

  const entity = await getEntityBySlug(entitySlug);
  if (!entity) {
    throw redirect(entityRowsRoute);
  }
  await verifyUserHasPermission(request, getEntityPermission(entity, "read"), tenantId);

  const item = await getRow(entity.id, rowId ?? params.id ?? "", tenantId);
  if (!item) {
    throw redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
  }
  const roles = await getUserRoles(userInfo.userId, tenantId);
  if (item.createdByUserId && item.createdByUserId !== userInfo.userId && !roles.find((f) => f.role.name === DefaultAppRoles.SuperUser)) {
    throw redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
  }
  const data: LoaderDataRowShare = {
    title: `${t("shared.share")} ${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    item,
    users: await getUsersByTenant(tenantId),
    rowPermissions: await getRowPermissions(item.id),
    publicUrl: `${process.env.SERVER_URL}/public/${entity.slug}/${item.id}`,
    entityRowsRoute,
  };
  return data;
};

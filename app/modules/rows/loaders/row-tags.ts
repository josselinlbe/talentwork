import { EntityTag, RowPermission } from "@prisma/client";
import { redirect } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getEntityTags } from "~/utils/db/entities/entityTags.db.server";
import { getRow, RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { getRowPermissions } from "~/utils/db/permissions/rowPermissions.db.server";
import { verifyUserHasPermission, getEntityPermission, getUserRowPermission } from "~/utils/helpers/PermissionsHelper";
import { getUserInfo } from "~/utils/session.server";
import { Params } from "react-router";
import UrlUtils from "~/utils/app/UrlUtils";

export type LoaderDataRowTags = {
  title: string;
  entity: EntityWithDetails;
  item: RowWithDetails;
  tags: EntityTag[];
  rowPermissions: RowPermission[];
};
export let loaderRowTags = async (request: Request, params: Params, tenantId: string | null, entitySlug: string, rowId?: string) => {
  let { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);

  const entity = await getEntityBySlug(entitySlug);
  if (!entity) {
    throw redirect("/404");
  }
  await verifyUserHasPermission(request, getEntityPermission(entity, "read"), tenantId);

  const item = await getRow(entity.id, rowId ?? params.id ?? "", tenantId);
  if (!item) {
    throw redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
  }
  const userRowPermissions = await getUserRowPermission(item, tenantId, userInfo.userId);
  if (!userRowPermissions.canUpdate || !entity.hasTags) {
    throw redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
  }
  const data: LoaderDataRowTags = {
    title: `${t("models.tag.plural")} ${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    item,
    tags: await getEntityTags(entity.id),
    rowPermissions: await getRowPermissions(item.id),
  };
  return data;
};

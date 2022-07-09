import { EntityTag, EntityWorkflowState } from "@prisma/client";
import { Params } from "react-router";
import { redirect } from "@remix-run/node";
import Constants from "~/application/Constants";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getEntityTags } from "~/utils/db/entities/entityTags.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { verifyUserHasPermission, getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import { getEntityFiltersFromCurrentUrl, getPaginationFromCurrentUrl, getRowsWithPagination } from "~/utils/helpers/RowPaginationHelper";
import { getUserInfo } from "~/utils/session.server";
import { getWorkflowStates } from "~/utils/db/workflows/workflowStates.db.server";

export type LoaderDataRowsView = {
  title: string;
  entity: EntityWithDetails;
  items: RowWithDetails[];
  tags: EntityTag[];
  pagination?: PaginationDto;
  workflowStates: EntityWorkflowState[];
};
export let loaderRowsView = async (request: Request, params: Params, entitySlug: string, tenantId: string | null) => {
  let { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  let entity = await getEntityBySlug(entitySlug ?? params.entity ?? "");
  if (!entity) {
    throw redirect("/404");
  }
  await verifyUserHasPermission(request, getEntityPermission(entity, "view"), tenantId);

  const currentPagination = getPaginationFromCurrentUrl(request);
  const filters = getEntityFiltersFromCurrentUrl(true, entity, request);
  const { items, pagination } = await getRowsWithPagination(
    entity.id,
    tenantId,
    userInfo.userId,
    Constants.DEFAULT_PAGE_SIZE,
    currentPagination.page,
    currentPagination.sortedBy,
    filters
  );

  const data: LoaderDataRowsView = {
    title: `${t(entity.titlePlural)} | ${process.env.APP_NAME}`,
    entity,
    items,
    pagination,
    tags: await getEntityTags(entity.id),
    workflowStates: await getWorkflowStates(entity.id),
  };
  return data;
};

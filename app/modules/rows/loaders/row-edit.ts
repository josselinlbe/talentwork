import { redirect } from "remix";
import { RowPermissionsDto } from "~/application/dtos/entities/RowPermissionsDto";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails, getRow } from "~/utils/db/entities/rows.db.server";
import { LinkedAccountWithDetailsAndMembers, getLinksWithMembers } from "~/utils/db/linkedAccounts.db.server";
import { LogWithDetails, getRowLogs } from "~/utils/db/logs.db.server";
import { verifyUserHasPermission, getEntityPermission, getUserRowPermission } from "~/utils/helpers/PermissionsHelper";
import { getRelatedRows } from "~/utils/services/entitiesService";
import { getUserInfo } from "~/utils/session.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { getRowComments, RowCommentWithDetails } from "~/utils/db/entities/rowComments.db.server";
import { getRowTasks, RowTaskWithDetails } from "~/utils/db/entities/rowTasks.db.server";
import { getRowTags, RowTagWithDetails } from "~/utils/db/entities/rowTags.db.server";
import { EntityWorkflowStepWithDetails, getWorkflowStepsFromState } from "~/utils/db/workflows/workflowSteps.db.server";
import { EntityWorkflowState } from "@prisma/client";
import { getWorkflowState } from "~/utils/db/workflows/workflowStates.db.server";
import { Params } from "react-router";

export type LoaderDataRowEdit = {
  title: string;
  entity: EntityWithDetails;
  item: any;
  logs: LogWithDetails[];
  comments: RowCommentWithDetails[];
  tasks: RowTaskWithDetails[];
  tags: RowTagWithDetails[];
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[];
  linkedAccounts: LinkedAccountWithDetailsAndMembers[];
  rowPermissions: RowPermissionsDto;
  nextWorkflowSteps: EntityWorkflowStepWithDetails[];
  currentWorkflowState: EntityWorkflowState | null;
  entityRowsRoute: string;
};

export let loaderRowEdit = async (request: Request, params: Params, tenantId: string | null, entitySlug: string, entityRowsRoute: string, rowId?: string) => {
  let { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);

  const entity = await getEntityBySlug(entitySlug ?? "");
  if (!entity) {
    throw redirect(entityRowsRoute);
  }
  await verifyUserHasPermission(request, getEntityPermission(entity, "read"), tenantId);

  const item = await getRow(entity.id, rowId ?? params.id ?? "", tenantId);
  if (!item) {
    throw redirect(entityRowsRoute);
  }
  const rowPermissions = await getUserRowPermission(item, tenantId, userInfo.userId);

  const relatedEntities = await getRelatedRows(entity.properties, tenantId);

  RowHelper.setObjectProperties(entity, item);

  const linkedAccounts = await getLinksWithMembers(tenantId);

  const nextWorkflowSteps = await getWorkflowStepsFromState(entity.id, item.workflowStateId ?? "");
  const currentWorkflowState = await getWorkflowState(item.workflowStateId ?? "");
  const data: LoaderDataRowEdit = {
    title: `${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    item,
    logs: await getRowLogs(tenantId, item.id),
    tags: await getRowTags(item.id),
    comments: await getRowComments(item.id),
    tasks: await getRowTasks(item.id),
    relatedEntities,
    linkedAccounts,
    rowPermissions,
    nextWorkflowSteps,
    currentWorkflowState,
    entityRowsRoute,
  };
  return data;
};

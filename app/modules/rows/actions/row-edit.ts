import { json, redirect } from "@remix-run/node";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { setRowCommentReaction } from "~/utils/db/entities/rowCommentReaction.db.server";
import { createRowComment, getRowComment, updateRowComment } from "~/utils/db/entities/rowComments.db.server";
import { getRow, updateRow, deleteRow } from "~/utils/db/entities/rows.db.server";
import { createRowTask, deleteRowTask, getRowTask, updateRowTask } from "~/utils/db/entities/rowTasks.db.server";
import { createRowLog } from "~/utils/db/logs.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getWorkflowStep } from "~/utils/db/workflows/workflowSteps.db.server";
import { sendEmail } from "~/utils/email.server";
import { verifyUserHasPermission, getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import RowHelper from "~/utils/helpers/RowHelper";
import { performRowWorkflowStep, updateRowWorkflowState } from "~/utils/services/WorkflowService";
import { getUserInfo } from "~/utils/session.server";
import DateUtils from "~/utils/shared/DateUtils";
import { Params } from "react-router";
import { getWorkflowState } from "~/utils/db/workflows/workflowStates.db.server";

export type ActionDataRowEdit = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionDataRowEdit) => json(data, { status: 400 });
export const actionRowEdit = async (
  request: Request,
  params: Params,
  tenantId: string | null,
  entitySlug: string,
  entityRowsRoute: string,
  rowId?: string,
  formData?: FormData
) => {
  const { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  const entity = await getEntityBySlug(entitySlug ?? "");
  if (!entity) {
    throw redirect(entityRowsRoute);
  }

  const item = await getRow(entity.id, rowId ?? params.id ?? "", tenantId);
  if (!item) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = formData ?? (await request.formData());
  const action = form.get("action")?.toString();

  if (action === "edit") {
    await verifyUserHasPermission(request, getEntityPermission(entity, "update"), tenantId);
    try {
      const rowValues = RowHelper.getRowPropertiesFromForm(t, entity, form, item);
      await updateRow(item.id ?? "", {
        dynamicProperties: rowValues.dynamicProperties,
        dynamicRows: rowValues.dynamicRows,
        properties: rowValues.properties,
      });
      await createRowLog(request, { tenantId: tenantId, createdByUserId: userInfo.userId, action: DefaultLogActions.Updated, entity, item });
      return json({});
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "delete") {
    await verifyUserHasPermission(request, getEntityPermission(entity, "delete"), tenantId);
    await createRowLog(request, { tenantId: tenantId, createdByUserId: userInfo.userId, action: DefaultLogActions.Deleted, entity, item });
    await deleteRow(item.id);
    return redirect(`/app/${params.tenant}/${entity.slug}`);
  } else if (action === "comment") {
    const value = form.get("comment")?.toString();
    if (!value) {
      return badRequest({ error: t("shared.invalidForm") });
    }
    const comment = await createRowComment({
      createdByUserId: userInfo.userId,
      rowId: item.id,
      value,
    });
    await createRowLog(request, {
      tenantId: tenantId,
      createdByUserId: userInfo.userId,
      action: DefaultLogActions.Commented,
      entity,
      item,
      commentId: comment.id,
      details: value,
    });

    const user = await getUser(userInfo.userId);
    if (item.createdByUser && user && item.createdByUser.email !== user.email) {
      try {
        await sendEmail(`${item.createdByUser.firstName} ${item.createdByUser.lastName} <${item.createdByUser.email}>`, "comment-notification", {
          action_url: process.env.SERVER_URL + UrlUtils.currentTenantUrl(params, `${entity.slug}/${item.id}`),
          commenter_name: `${user.firstName} ${user.lastName}`,
          commenter_email: user.email,
          folio: RowHelper.getRowFolio(entity, item),
          body: value,
          timestamp: DateUtils.dateYMDHMS(comment.createdAt),
        });
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.log("[ERROR SENDING EMAIL]: " + e);
      }
    }

    return json({});
  } else if (action === "comment-reaction") {
    const rowCommentId = form.get("comment-id")?.toString();
    const reaction = form.get("reaction")?.toString();
    if (!rowCommentId || !reaction) {
      return badRequest({ error: t("shared.invalidForm") });
    }
    await getRowComment(rowCommentId);
    await setRowCommentReaction({
      createdByUserId: userInfo.userId,
      rowCommentId,
      reaction,
    });
    return json({});
  } else if (action === "comment-delete") {
    const rowCommentId = form.get("comment-id")?.toString();
    if (!rowCommentId) {
      return badRequest({ error: t("shared.invalidForm") });
    }
    await updateRowComment(rowCommentId, { isDeleted: true });
    return json({});
  } else if (action === "task-new") {
    const taskTitle = form.get("task-title")?.toString();
    if (!taskTitle) {
      return badRequest({ error: t("shared.invalidForm") });
    }
    await createRowTask({
      createdByUserId: userInfo.userId,
      rowId: item.id,
      title: taskTitle,
    });
    return json({});
  } else if (action === "task-complete-toggle") {
    const taskId = form.get("task-id")?.toString() ?? "";
    const task = await getRowTask(taskId);
    if (task) {
      if (task.completed) {
        await updateRowTask(taskId, {
          completed: false,
          completedAt: null,
          completedByUserId: null,
        });
      } else {
        await updateRowTask(taskId, {
          completed: true,
          completedAt: new Date(),
          completedByUserId: userInfo.userId,
        });
      }
    }
    return json({});
  } else if (action === "task-delete") {
    const taskId = form.get("task-id")?.toString() ?? "";
    const task = await getRowTask(taskId);
    if (task) {
      await deleteRowTask(taskId);
    }
    return json({});
  } else if (action === "workflow-set-state") {
    const workflowStepId = form.get("workflow-step-id")?.toString() ?? "";
    const workflowStep = await getWorkflowStep(workflowStepId);
    if (workflowStep) {
      await performRowWorkflowStep(entity, item, workflowStep, { byUserId: userInfo.userId }, request);
    }
    return json({});
  } else if (action === "workflow-set-manual-state") {
    const workflowStateId = form.get("workflow-state-id")?.toString() ?? "";
    const workflowState = await getWorkflowState(workflowStateId);
    if (workflowState) {
      await updateRowWorkflowState(item.id, workflowState.id);
    }
    return json({});
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

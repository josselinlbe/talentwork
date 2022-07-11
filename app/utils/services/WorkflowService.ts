import { EntityWorkflowState, EntityWorkflowStep } from "@prisma/client";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { Visibility } from "~/application/dtos/shared/Visibility";
import { Colors } from "~/application/enums/shared/Colors";
import { db } from "../db.server";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails } from "../db/entities/rows.db.server";
import { createManualRowLog } from "../db/logs.db.server";
import { createRowWorkflowTransition, getRowWorkflowTransition } from "../db/workflows/rowWorkflowTransitions.db.server";
import { createWorkflowState, getWorkflowStates } from "../db/workflows/workflowStates.db.server";
import { createWorkflowStep } from "../db/workflows/workflowSteps.db.server";

export async function createDefaultEntityWorkflow(entityId: string) {
  const statePending = await createState(entityId, {
    order: 1,
    name: "pending",
    title: "Pending",
    color: Colors.YELLOW,
    canUpdate: true,
    canDelete: true,
    emailSubject: "",
    emailBody: "",
  });
  const stateCompleted = await createState(entityId, {
    order: 2,
    name: "completed",
    title: "Completed",
    color: Colors.GREEN,
    canUpdate: false,
    canDelete: false,
    emailSubject: "{user} has accepted your request",
    emailBody: "<p>{user} accepted your request {folio}.</p>",
  });
  const stateCancelled = await createState(entityId, {
    order: 3,
    name: "cancelled",
    title: "Cancelled",
    color: Colors.RED,
    canUpdate: false,
    canDelete: false,
    emailSubject: "{user} has rejected your request",
    emailBody: "<p>{user} rejected your request {folio}.</p>",
  });

  await createStep(entityId, "Cancel", statePending, stateCancelled, Visibility.Private);
  await createStep(entityId, "Done", statePending, stateCompleted, Visibility.Private);
  await createStep(entityId, "Recall", stateCompleted, statePending, Visibility.Private);

  // await createStep(entityId, "Send to Manager", stateDraft, statePendingApprovalByManager, []);
  // await createStep(entityId, "Recall", statePendingApprovalByManager, stateDraft, []);
  // await createStep(entityId, "Reject", statePendingApprovalByManager, stateRejected, [fakeRoleService.roles[1]]);
  // await createStep(entityId, "Send to Manager", stateRejected, statePendingApprovalByManager, []);
  // await createStep(entityId, "Send to Director", statePendingApprovalByManager, statePendingApprovalByDirector, [fakeRoleService.roles[1]]);
  // await createStep(entityId, "Reject", statePendingApprovalByDirector, stateRejected, [fakeRoleService.roles[3]]);
  // await createStep(entityId, "Accept", statePendingApprovalByDirector, stateCompleted, [fakeRoleService.roles[3]]);
  // await createStep(entityId, "Cancel", stateRejected, stateCancelled, [fakeRoleService.roles[3]]);
}

export async function createCustomEntityWorkflowStates(entityId: string, workflowStates: { name: string; title: string; color: Colors }[] | null) {
  if (workflowStates === null) {
    return;
  }
  await Promise.all(
    workflowStates.map(async (workflowState, idx) => {
      const state = await createState(entityId, {
        order: idx + 1,
        name: workflowState.name,
        title: workflowState.title,
        color: workflowState.color,
        canUpdate: true,
        canDelete: true,
        emailSubject: "",
        emailBody: "",
      });
      return state;
    })
  );
}

async function createState(
  entityId: string,
  state: {
    order: number;
    name: string;
    title: string;
    color: Colors;
    canUpdate: boolean;
    canDelete: boolean;
    emailSubject: string;
    emailBody: string;
  }
) {
  return await createWorkflowState({
    entityId,
    ...state,
  });
}

async function createStep(entityId: string, action: string, fromState: EntityWorkflowState, toState: EntityWorkflowState, assignTo: string) {
  return await createWorkflowStep({
    entityId,
    action,
    fromStateId: fromState.id,
    toStateId: toState.id,
    assignTo,
  });
}

export async function setRowInitialWorkflowState(entityId: string, rowId: string) {
  const entity = await getEntityById(entityId);
  if (!entity?.hasWorkflow) {
    return;
  }

  const workflowStates = await getWorkflowStates(entityId);
  if (workflowStates.length > 0) {
    await updateRowWorkflowState(rowId, workflowStates[0].id);
  }
}

export async function performRowWorkflowStep(entity: EntityWithDetails, row: RowWithDetails, workflowStep: EntityWorkflowStep, userId: string, request?: Request) {
  if (workflowStep) {
    await updateRowWorkflowState(row.id, workflowStep.toStateId);
    const transition = await createRowWorkflowTransition(row.id, workflowStep.id, userId);
    const workflowTransition = await getRowWorkflowTransition(transition.id);
    await createManualRowLog({
      tenantId: row.tenantId,
      createdByUserId: userId,
      createdByApiKey: null,
      action: DefaultLogActions.WorkflowTransition,
      entity,
      item: row,
      workflowTransition,
    }, request);
  }
}

export async function updateRowWorkflowState(id: string, workflowStateId: string) {
  return await db.row.update({
    where: {
      id,
    },
    data: {
      workflowStateId,
    },
  });
}

export async function getEntityById(id: string): Promise<EntityWithDetails | null> {
  return await db.entity.findUnique({
    where: {
      id,
    },
    include: {
      workflowStates: true,
      properties: {
        orderBy: { order: "asc" },
        include: {
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
}

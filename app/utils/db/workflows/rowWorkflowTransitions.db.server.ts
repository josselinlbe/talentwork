import { EntityWorkflowState, EntityWorkflowStep, RowWorkflowTransition } from "@prisma/client";
import { db } from "~/utils/db.server";
import { includeSimpleCreatedByUser, UserSimple } from "../users.db.server";

export type RowWorkflowTransitionWithDetails = RowWorkflowTransition & {
  createdByUser: UserSimple;
  workflowStep: EntityWorkflowStep & {
    fromState: EntityWorkflowState;
    toState: EntityWorkflowState;
  };
};

export async function getRowWorkflowTransitions(rowId: string): Promise<RowWorkflowTransitionWithDetails[]> {
  return await db.rowWorkflowTransition.findMany({
    where: {
      rowId,
    },
    include: {
      ...includeSimpleCreatedByUser,
      workflowStep: {
        include: {
          fromState: true,
          toState: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getRowWorkflowTransition(id: string): Promise<RowWorkflowTransitionWithDetails | null> {
  return await db.rowWorkflowTransition.findUnique({
    where: {
      id,
    },
    include: {
      ...includeSimpleCreatedByUser,
      workflowStep: {
        include: {
          fromState: true,
          toState: true,
        },
      },
    },
  });
}

export async function createRowWorkflowTransition(rowId: string, workflowStepId: string, createdByUserId: string): Promise<RowWorkflowTransition> {
  return await db.rowWorkflowTransition.create({
    data: {
      rowId,
      workflowStepId,
      createdByUserId,
    },
  });
}

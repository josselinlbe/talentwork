import { EntityWorkflowState, EntityWorkflowStep } from "@prisma/client";
import { Colors } from "~/application/enums/shared/Colors";
import { db } from "~/utils/db.server";

export type EntityWorkflowStateWithSteps = EntityWorkflowState & {
  fromStates: EntityWorkflowStep[];
  toStates: EntityWorkflowStep[];
};

export async function getWorkflowStates(entityId: string): Promise<EntityWorkflowStateWithSteps[]> {
  return await db.entityWorkflowState.findMany({
    where: {
      entityId,
    },
    include: {
      fromStates: true,
      toStates: true,
    },
    orderBy: [{ order: "asc" }],
  });
}

export async function getWorkflowState(id: string): Promise<EntityWorkflowStateWithSteps | null> {
  return await db.entityWorkflowState.findUnique({
    where: {
      id,
    },
    include: {
      fromStates: true,
      toStates: true,
    },
  });
}

export async function createWorkflowState(data: {
  entityId: string;
  order: number;
  name: string;
  title: string;
  color: Colors;
  canUpdate: boolean;
  canDelete: boolean;
  emailSubject: string;
  emailBody: string;
}) {
  return await db.entityWorkflowState.create({
    data,
  });
}

export async function updateWorkflowState(
  id: string,
  data: {
    order?: number;
    name?: string;
    title?: string;
    color?: Colors;
    canUpdate?: boolean;
    canDelete?: boolean;
    emailSubject?: string;
    emailBody?: string;
  }
) {
  return await db.entityWorkflowState.update({
    where: { id },
    data,
  });
}

export async function deleteWorkflowState(id: string) {
  return await db.entityWorkflowState.delete({
    where: { id },
  });
}

import { EntityWorkflowStep, Tenant, Role, Group, User, EntityWorkflowState, EntityWorkflowStepAssignee } from "@prisma/client";
import { db } from "~/utils/db.server";

export type EntityWorkflowStepWithDetails = EntityWorkflowStep & {
  assignees: (EntityWorkflowStepAssignee & {
    tenant: Tenant | null;
    role: Role | null;
    group: Group | null;
    user: User | null;
  })[];
  fromState: EntityWorkflowState;
  toState: EntityWorkflowState;
};

export async function getWorkflowSteps(entityId: string): Promise<EntityWorkflowStepWithDetails[]> {
  return await db.entityWorkflowStep.findMany({
    where: {
      entityId,
    },
    include: {
      fromState: true,
      toState: true,
      assignees: {
        include: {
          tenant: true,
          role: true,
          group: true,
          user: true,
        },
      },
    },
    orderBy: {
      fromState: {
        order: "asc",
      },
    },
  });
}

export async function getWorkflowStepsFromState(entityId: string, fromStateId: string): Promise<EntityWorkflowStepWithDetails[]> {
  return await db.entityWorkflowStep.findMany({
    where: {
      fromStateId,
      entityId,
    },
    include: {
      fromState: true,
      toState: true,
      assignees: {
        include: {
          tenant: true,
          role: true,
          group: true,
          user: true,
        },
      },
    },
    orderBy: {
      toState: {
        order: "asc",
      },
    },
  });
}

export async function getWorkflowStep(id: string): Promise<EntityWorkflowStepWithDetails | null> {
  return await db.entityWorkflowStep.findUnique({
    where: {
      id,
    },
    include: {
      fromState: true,
      toState: true,
      assignees: {
        include: {
          tenant: true,
          role: true,
          group: true,
          user: true,
        },
      },
    },
  });
}

export async function createWorkflowStep(data: { entityId: string; action: string; fromStateId: string; toStateId: string; assignTo: string }) {
  return await db.entityWorkflowStep.create({
    data,
  });
}

export async function updateWorkflowStep(
  id: string,
  data: { entityId?: string; action?: string; fromStateId?: string; toStateId?: string; assignTo?: string }
) {
  return await db.entityWorkflowStep.update({
    where: { id },
    data,
  });
}

export async function deleteWorkflowStep(id: string) {
  return await db.entityWorkflowStep.delete({
    where: { id },
  });
}

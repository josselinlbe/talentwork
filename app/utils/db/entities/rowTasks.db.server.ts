import { RowTask, User } from "@prisma/client";
import { db } from "~/utils/db.server";

export type RowTaskWithDetails = RowTask & {
  createdByUser: User;
  assignedToUser: User | null;
};

export async function getRowTasks(rowId: string): Promise<RowTaskWithDetails[]> {
  return await db.rowTask.findMany({
    where: {
      rowId,
    },
    include: {
      createdByUser: true,
      assignedToUser: true,
    },
    orderBy: [
      {
        completed: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
}

export async function getRowTask(id: string): Promise<RowTaskWithDetails | null> {
  return await db.rowTask.findUnique({
    where: {
      id,
    },
    include: {
      createdByUser: true,
      assignedToUser: true,
    },
  });
}

export async function createRowTask(data: {
  createdByUserId: string;
  rowId: string;
  title: string;
  description?: string;
  completed?: boolean;
  completedAt?: Date | null;
  completedByUserId?: string | null;
  assignedToUserId?: string | null;
  deadline?: Date | null;
}) {
  return await db.rowTask.create({
    data: {
      createdByUserId: data.createdByUserId,
      rowId: data.rowId,
      title: data.title,
      description: data.description ?? "",
      completed: data.completed ?? false,
      completedAt: data.completedAt ?? null,
      completedByUserId: data.completedByUserId ?? null,
      assignedToUserId: data.assignedToUserId ?? null,
      deadline: data.deadline ?? null,
    },
  });
}

export async function updateRowTask(
  id: string,
  data: {
    createdByUserId?: string;
    rowId?: string;
    title?: string;
    description?: string;
    completed?: boolean;
    completedAt?: Date | null;
    completedByUserId?: string | null;
    assignedToUserId?: string | null;
    deadline?: Date | null;
  }
) {
  return await db.rowTask.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteRowTask(id: string) {
  return await db.rowTask.delete({
    where: {
      id,
    },
  });
}

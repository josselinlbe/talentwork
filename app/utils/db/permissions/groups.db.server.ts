import { Group, GroupUser, User } from "@prisma/client";
import { db } from "~/utils/db.server";

export type GroupWithDetails = Group & {
  users: (GroupUser & { user: User })[];
};

export async function getAllGroups(tenantId: string): Promise<GroupWithDetails[]> {
  return await db.group.findMany({
    where: {
      tenantId,
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
}

export async function getGroups(tenantId: string, ids: string[]): Promise<GroupWithDetails[]> {
  return await db.group.findMany({
    where: {
      tenantId,
      id: {
        in: ids,
      },
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
}

export async function getMyGroups(userId: string): Promise<GroupWithDetails[]> {
  return await db.group.findMany({
    where: {
      OR: [
        {
          createdByUserId: userId,
        },
        {
          users: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
}

export async function getGroup(id: string): Promise<GroupWithDetails | null> {
  return await db.group.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function createGroup(data: { createdByUserId: string; tenantId: string; name: string; description: string; color: number }) {
  return await db.group.create({
    data,
  });
}

export async function updateGroup(id: string, data: { name: string; description: string; color: number }) {
  return await db.group.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteGroup(id: string) {
  return await db.group.delete({
    where: {
      id,
    },
  });
}
import { db } from "../../db.server";
import { Permission, Role, RolePermission, User, UserRole } from "@prisma/client";

export type RoleWithPermissions = Role & {
  permissions: (RolePermission & { permission: Permission })[];
};

export type RoleWithPermissionsAndUsers = RoleWithPermissions & {
  users: (UserRole & { user: User })[];
};

export async function getAllRoles(type?: "admin" | "app"): Promise<RoleWithPermissions[]> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }

  return await db.role.findMany({
    where,
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: [
      {
        type: "asc",
      },
      {
        order: "asc",
      },
    ],
  });
}

export async function getAllRolesWithUsers(type?: "admin" | "app"): Promise<RoleWithPermissionsAndUsers[]> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }

  return await db.role.findMany({
    where,
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      users: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      {
        type: "asc",
      },
      {
        order: "asc",
      },
    ],
  });
}

export async function getRole(id: string): Promise<RoleWithPermissions | null> {
  return await db.role.findUnique({
    where: {
      id,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

export async function getRoleByName(name: string): Promise<RoleWithPermissions | null> {
  return await db.role.findUnique({
    where: {
      name,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

export async function getNextRolesOrder(type?: "admin" | "app"): Promise<number> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }
  return (
    ((
      await db.role.aggregate({
        where,
        _max: {
          order: true,
        },
      })
    )._max.order ?? 0) + 1
  );
}

export async function createRole(data: {
  order: number;
  name: string;
  description: string;
  type: "admin" | "app";
  assignToNewUsers: boolean;
  isDefault: boolean;
}) {
  return await db.role.create({
    data,
  });
}

export async function updateRole(id: string, data: { name: string; description: string; type: "admin" | "app"; assignToNewUsers: boolean }) {
  return await db.role.update({
    where: { id },
    data,
  });
}

export async function deleteRole(id: string) {
  return await db.role.delete({
    where: { id },
  });
}

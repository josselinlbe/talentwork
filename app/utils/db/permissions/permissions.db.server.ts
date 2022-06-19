import { db } from "../../db.server";
import { Permission, Role, RolePermission } from "@prisma/client";
import { getRoleByName } from "./roles.db.server";
import { createRolePermission } from "./rolePermissions.db.server";

export type PermissionWithRoles = Permission & {
  inRoles: (RolePermission & { role: Role })[];
};

export async function getAllPermissions(type?: string): Promise<PermissionWithRoles[]> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }

  return await db.permission.findMany({
    where,
    include: {
      inRoles: {
        include: {
          role: true,
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

export async function getPermission(id: string): Promise<PermissionWithRoles | null> {
  return await db.permission.findUnique({
    where: {
      id,
    },
    include: {
      inRoles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getPermissionByName(name: string): Promise<PermissionWithRoles | null> {
  return await db.permission.findUnique({
    where: {
      name,
    },
    include: {
      inRoles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getNextPermissionsOrder(type?: string): Promise<number> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }
  return (
    ((
      await db.permission.aggregate({
        where,
        _max: {
          order: true,
        },
      })
    )._max.order ?? 0) + 1
  );
}

export async function createPermissions(permissions: { inRoles: string[]; name: string; description: string; type: string }[], fromOrder: number = 0) {
  return Promise.all(
    permissions.map(async (data, idx) => {
      const permission = await createPermission({
        order: fromOrder + idx + 1,
        name: data.name,
        description: data.description,
        type: data.type,
        isDefault: true,
      });

      data.inRoles.map(async (inRole) => {
        const role = await getRoleByName(inRole);
        if (!role) {
          throw new Error("Role required: " + inRole);
        }
        return await createRolePermission({
          permissionId: permission.id,
          roleId: role.id,
        });
      });
    })
  );
}

export async function createPermission(data: { order: number; name: string; description: string; type: string; isDefault: boolean }) {
  return await db.permission.create({
    data,
  });
}

export async function updatePermission(id: string, data: { name: string; description: string; type: string }) {
  return await db.permission.update({
    where: { id },
    data,
  });
}

export async function deletePermission(id: string) {
  return await db.permission.delete({
    where: { id },
  });
}

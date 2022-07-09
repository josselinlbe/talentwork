import { db } from "../../db.server";
import { Permission, Role, RolePermission, UserRole } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import { includeSimpleUser, UserSimple } from "../users.db.server";

export type RoleWithPermissions = Role & {
  permissions: (RolePermission & { permission: Permission })[];
};

export type RoleWithPermissionsAndUsers = RoleWithPermissions & {
  users: (UserRole & { user: UserSimple })[];
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

export async function getAllRolesWithUsers(type?: "admin" | "app", filters?: FiltersDto): Promise<RoleWithPermissionsAndUsers[]> {
  let where: any = {
    type,
  };
  if (filters !== undefined) {
    where = RowFiltersHelper.getFiltersCondition(filters);
    const permissionId = filters?.properties.find((f) => f.name === "permissionId")?.value;
    if (permissionId) {
      where = {
        OR: [where, { permissions: { some: { permissionId } } }],
      };
    }
    if (type !== undefined) {
      where = {
        AND: [type, where],
      };
    }
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
          ...includeSimpleUser,
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

export async function getRoles(ids: string[]): Promise<RoleWithPermissionsAndUsers[]> {
  return await db.role.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      users: {
        include: {
          ...includeSimpleUser,
        },
      },
    },
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

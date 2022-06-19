import { Entity, Permission, Row } from "@prisma/client";
import { redirect } from "remix";
import { RowPermissionsDto } from "~/application/dtos/entities/RowPermissionsDto";
import { getMyGroups } from "../db/permissions/groups.db.server";
import { getPermissionByName } from "../db/permissions/permissions.db.server";
import { getRowPermissionByGroups, getRowPermissionByTenant, getRowPermissionByUsers } from "../db/permissions/rowPermissions.db.server";
import { getUserRoles } from "../db/permissions/userRoles.db.server";
import { getUserInfo } from "../session.server";

export async function getEntityPermissions(entity: Entity): Promise<{ name: string; description: string }[]> {
  return [
    { name: getEntityPermission(entity, "view"), description: `View ${entity.name} page` },
    { name: getEntityPermission(entity, "read"), description: `View ${entity.name} records` },
    { name: getEntityPermission(entity, "create"), description: `Create ${entity.name}` },
    { name: getEntityPermission(entity, "update"), description: `Update ${entity.name}` },
    { name: getEntityPermission(entity, "delete"), description: `Delete ${entity.name}` },
  ];
}

export function getEntityPermission(entity: Entity, permission: "view" | "read" | "create" | "update" | "delete") {
  return `app.entity.${entity.name}.${permission}`;
}

export async function getUserPermission(request: Request, permissionName: string, tenantId: string | null = null) {
  const permission = await getPermissionByName(permissionName);
  const userInfo = await getUserInfo(request);
  const userRoles = await getUserRoles(userInfo.userId, tenantId);
  let userPermission: Permission | undefined = undefined;
  userRoles.forEach((userRole) => {
    userRole.role.permissions.forEach((rolePermission) => {
      if (rolePermission.permission.name === permissionName) {
        userPermission = rolePermission.permission;
      }
    });
  });
  return { permission, userPermission };
}

export async function verifyUserHasPermission(request: Request, permissionName: string, tenantId: string | null = null) {
  const { permission, userPermission } = await getUserPermission(request, permissionName, tenantId);
  if (permission && !userPermission) {
    if (tenantId) {
      throw redirect(`/unauthorized/${permissionName}/${tenantId}/?redirect=${new URL(request.url).pathname}`);
    } else {
      throw redirect(`/unauthorized/${permissionName}?redirect=${new URL(request.url).pathname}`);
    }
  }
}

export async function getUserRowPermission(row: Row, tenantId?: string, userId?: string) {
  const permissions: RowPermissionsDto = {
    visibility: row.visibility,
    canRead: false,
    canComment: false,
    canUpdate: false,
    canDelete: false,
  };
  const userRoles = await getUserRoles(userId ?? "");
  if (row.createdByUserId === userId || userRoles.find((f) => f.role.name === "SuperAdmin")) {
    permissions.canRead = permissions.canComment = permissions.canUpdate = permissions.canDelete = true;
    return permissions;
  } else if (row.visibility === "private") {
    if (!row.createdByUserId || row.createdByUserId === userId) {
      permissions.canRead = permissions.canComment = permissions.canUpdate = permissions.canDelete = true;
    }
  } else if (row.visibility === "public") {
    permissions.canRead = true;
    permissions.canComment = row.canComment;
    permissions.canUpdate = row.canUpdate;
    permissions.canDelete = row.canDelete;
  } else if (row.visibility === "tenant" && tenantId) {
    const tenantPermission = await getRowPermissionByTenant(row.id, tenantId);
    if (tenantPermission) {
      permissions.canRead = true;
      permissions.canComment = row.canComment;
      permissions.canUpdate = row.canUpdate;
      permissions.canDelete = row.canDelete;
    }
  } else if (row.visibility === "groups" && userId) {
    const userGroups = await getMyGroups(userId ?? "");
    const groupPermission = await getRowPermissionByGroups(
      row.id,
      userGroups.map((f) => f.id)
    );
    if (groupPermission) {
      permissions.canRead = true;
      permissions.canComment = row.canComment;
      permissions.canUpdate = row.canUpdate;
      permissions.canDelete = row.canDelete;
    }
  } else if (row.visibility === "users" && userId) {
    const userPermission = await getRowPermissionByUsers(row.id, [userId]);
    if (userPermission) {
      permissions.canRead = true;
      permissions.canComment = row.canComment;
      permissions.canUpdate = row.canUpdate;
      permissions.canDelete = row.canDelete;
    }
  }

  return permissions;
}

export async function getRowPermissionsCondition(tenantId: string, userId: string) {
  const userRoles = await getUserRoles(userId);
  if (userRoles.find((f) => f.role.name === "SuperAdmin")) {
    return {};
  }

  const userGroups = await getMyGroups(userId ?? "");
  const where = {
    OR: [
      {
        createdByUserId: {
          in: null,
        },
      },
      {
        createdByUserId: userId,
      },
      {
        visibility: "public",
      },
      {
        permissions: {
          some: {
            tenantId,
          },
        },
      },
      {
        permissions: {
          some: {
            groupId: {
              in: userGroups.map((f) => f.id),
            },
          },
        },
      },
      {
        permissions: {
          some: {
            userId,
          },
        },
      },
    ],
  };
  return where;
}

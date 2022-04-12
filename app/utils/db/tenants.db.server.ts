import { AdminUser, Tenant, TenantUser, User, Workspace } from "@prisma/client";
import { TenantUserJoined } from "~/application/enums/tenants/TenantUserJoined";
import { TenantUserStatus } from "~/application/enums/tenants/TenantUserStatus";
import { db } from "~/utils/db.server";
import UrlUtils from "../app/UrlUtils";
import { createTenantSubscription, TenantSubscriptionWithDetails } from "./tenantSubscriptions.db.server";

export type MyTenant = TenantUser & {
  tenant: Tenant & {
    workspaces: (Workspace & {
      tenant: Tenant;
    })[];
  };
};

export type TenantWithDetails = Tenant & {
  workspaces: Workspace[];
  users: (TenantUser & {
    user: User;
  })[];
  subscription: TenantSubscriptionWithDetails | null;
  usersCount?: number;
  workspacesCount?: number;
  contractsCount?: number;
  employeesCount?: number;
};

export type WorkspaceWithTenant = Workspace & {
  tenant: Tenant;
};

export type TenantUserWithUser = TenantUser & {
  user: User & {
    admin?: AdminUser | null;
  };
};

export async function adminGetAllTenants(): Promise<TenantWithDetails[]> {
  return await db.tenant.findMany({
    include: {
      workspaces: true,
      users: {
        include: {
          user: true,
        },
      },
      subscription: {
        include: {
          subscriptionPrice: {
            include: {
              subscriptionProduct: true,
            },
          },
        },
      },
    },
  });
}

export async function getTenant(id?: string) {
  if (!id) {
    return null;
  }
  return await db.tenant.findUnique({
    where: {
      id,
    },
    include: {
      subscription: true,
    },
  });
}

export async function getTenantBySlug(slug: string) {
  return await db.tenant.findUnique({
    where: {
      slug,
    },
  });
}

export async function getTenantWithUsersAndWorkspaces(id?: string) {
  if (!id) {
    return null;
  }
  return await db.tenant.findUnique({
    where: {
      id,
    },
    include: {
      workspaces: true,
      users: true,
    },
  });
}

export async function getMyTenants(userId: string): Promise<MyTenant[]> {
  const tenants = await db.tenantUser.findMany({
    where: {
      userId,
    },
    include: {
      tenant: {
        include: {
          workspaces: {
            include: {
              tenant: true,
            },
          },
        },
      },
    },
  });
  // if (tenants.length > 0) {
  //   const currentTenants = tenants.filter((f) => f.current);
  //   if (currentTenants.length > 1) {
  //     currentTenants.forEach(async (tenantUser) => {
  //       await db.tenantUser.update({
  //         where: {
  //           id: tenantUser.id,
  //         },
  //         data: {
  //           current: false,
  //         },
  //       });
  //       tenantUser.current = false;
  //     });
  //   }
  //   if (currentTenants.length === 0) {
  //     await db.tenantUser.update({
  //       where: {
  //         id: tenants[0].id,
  //       },
  //       data: {
  //         current: true,
  //       },
  //     });
  //     tenants[0].current = true;
  //   }
  // }
  return tenants;
}

export async function getTenantUsersCount(tenantId: string) {
  return await db.tenantUser.count({
    where: { tenantId },
  });
}

export async function getTenantUsers(tenantId?: string): Promise<TenantUserWithUser[]> {
  if (!tenantId) {
    return [];
  }
  return await db.tenantUser.findMany({
    where: {
      tenantId,
    },
    include: {
      user: {
        include: {
          admin: true,
        },
      },
    },
  });
}

export async function getTenantUser(id?: string) {
  if (!id) {
    return null;
  }
  return await db.tenantUser.findUnique({
    where: {
      id,
    },
    include: {
      tenant: true,
      user: true,
    },
  });
}

export async function getTenantMember(userId?: string, tenantId?: string) {
  return await db.tenantUser.findFirst({
    where: {
      userId,
      tenantId,
    },
    include: {
      tenant: true,
      user: true,
    },
  });
}

export async function updateTenant(data: { name: string; icon: string; slug: string }, id?: string) {
  if (!id) {
    return;
  }
  return await db.tenant.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateTenantUser(id: string, data: { role: number }) {
  return await db.tenantUser.update({
    where: {
      id,
    },
    data,
  });
}

export async function createTenant(name: string, subscriptionCustomerId: string, icon: string) {
  const tenant = await db.tenant.create({
    data: {
      name,
      slug: UrlUtils.slugify(name),
      icon,
    },
  });

  await createTenantSubscription(tenant.id, subscriptionCustomerId);

  return tenant;
}

export async function createTenantUser(data: { tenantId: string; userId: string; role: number }) {
  return await db.tenantUser.create({
    data: {
      ...data,
      joined: TenantUserJoined.JOINED_BY_INVITATION,
      status: TenantUserStatus.ACTIVE,
    },
  });
}

export async function deleteTenantUser(id: string) {
  return await db.tenantUser.delete({
    where: {
      id,
    },
  });
}

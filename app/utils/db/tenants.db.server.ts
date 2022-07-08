import { AdminUser, Role, Tenant, TenantInboundAddress, TenantUser, User } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { TenantUserJoined } from "~/application/enums/tenants/TenantUserJoined";
import { TenantUserStatus } from "~/application/enums/tenants/TenantUserStatus";
import { db } from "~/utils/db.server";
import RowFiltersHelper from "../helpers/RowFiltersHelper";
import { getAvailableTenantInboundAddress, getAvailableTenantSlug } from "../services/emailService";
import { createUserRole } from "./permissions/userRoles.db.server";
import { TenantSubscriptionWithDetails } from "./tenantSubscriptions.db.server";
import { createTenantSubscription } from "./tenantSubscriptions.db.server";

export type MyTenant = TenantUser & {
  tenant: Tenant;
};

export type TenantWithDetails = Tenant & {
  inboundAddresses: TenantInboundAddress[];
  users: (TenantUser & {
    user: User;
  })[];
  subscription: TenantSubscriptionWithDetails | null;
};

export type TenantWithUsage = TenantWithDetails & {
  _count: {
    users?: number;
    invitations?: number;
    rows?: number;
    logs?: number;
    apiKeys?: number;
    createdLinkedAccounts?: number;
    asProviderLinkedAccounts?: number;
    asClientLinkedAccounts?: number;
  };
};

const includeTenantWithDetails = {
  inboundAddresses: true,
  users: {
    include: {
      user: true,
    },
  },
  subscription: {
    include: {
      subscriptionPrice: {
        include: {
          subscriptionProduct: {
            include: {
              features: true,
            },
          },
        },
      },
    },
  },
};

export type TenantUserWithUser = TenantUser & {
  user: User & {
    admin?: AdminUser | null;
  };
};

export async function adminGetAllTenants(): Promise<TenantWithDetails[]> {
  return await db.tenant.findMany({
    include: {
      ...includeTenantWithDetails,
    },
  });
}

export async function adminGetAllTenantsWithUsage(filters?: FiltersDto): Promise<TenantWithUsage[]> {
  let where = RowFiltersHelper.getFiltersCondition(filters);
  const userId = filters?.properties.find((f) => f.name === "userId")?.value ?? filters?.query ?? "";
  if (userId) {
    where = {
      OR: [where, { users: { some: { userId } } }],
    };
  }
  return await db.tenant.findMany({
    where,
    include: {
      inboundAddresses: true,
      users: {
        include: {
          user: true,
        },
      },
      subscription: {
        include: {
          subscriptionPrice: {
            include: {
              subscriptionProduct: {
                include: {
                  features: true,
                },
              },
            },
          },
        },
      },
      _count: true,
    },
  });
}

export async function getTenant(id?: string): Promise<TenantWithDetails | null> {
  if (!id) {
    return null;
  }
  return await db.tenant.findUnique({
    where: {
      id,
    },
    include: {
      ...includeTenantWithDetails,
    },
  });
}

export async function getTenantByIdOrSlug(id: string) {
  return await db.tenant.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
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

export async function getTenantWithUsers(id?: string) {
  if (!id) {
    return null;
  }
  return await db.tenant.findUnique({
    where: {
      id,
    },
    include: {
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
      tenant: true,
    },
  });

  return tenants;
}

export async function getTenantUsersCount(tenantId: string) {
  return await db.tenantUser.count({
    where: { tenantId },
  });
}

export async function getTenantUsers(tenantId?: string | null): Promise<TenantUserWithUser[]> {
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

export async function updateTenantUser(id: string, data: { type: number }) {
  return await db.tenantUser.update({
    where: {
      id,
    },
    data,
  });
}

export async function createTenant(name: string, subscriptionCustomerId: string, icon: string) {
  const slug = await getAvailableTenantSlug(name);
  const inboundAddress = await getAvailableTenantInboundAddress(name);
  const tenant = await db.tenant.create({
    data: {
      name,
      slug,
      icon,
      inboundAddresses: {
        create: [{ address: inboundAddress }],
      },
    },
  });

  await createTenantSubscription(tenant.id, subscriptionCustomerId, 0);

  return tenant;
}

export async function createTenantUser(data: { tenantId: string; userId: string; type: number }, roles: Role[]) {
  const tenantUser = await db.tenantUser.create({
    data: {
      ...data,
      joined: TenantUserJoined.JOINED_BY_INVITATION,
      status: TenantUserStatus.ACTIVE,
    },
  });

  await Promise.all(
    roles.map(async (role) => {
      return await createUserRole(tenantUser.userId, role.id, tenantUser.tenantId);
    })
  );

  return tenantUser;
}

export async function deleteTenantUser(id: string) {
  return await db.tenantUser.delete({
    where: {
      id,
    },
  });
}

export async function deleteTenant(id: string) {
  return await db.tenant.delete({
    where: {
      id,
    },
    include: {
      subscription: true,
      users: true,
      invitations: true,
      rows: true,
      logs: true,
      apiKeys: true,
      createdLinkedAccounts: true,
      asProviderLinkedAccounts: true,
      asClientLinkedAccounts: true,
      userRoles: true,
    },
  });
}

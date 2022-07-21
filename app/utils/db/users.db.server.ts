import { AdminUser, Role, Tenant, TenantUser, UserRole } from ".prisma/client";
import bcrypt from "bcryptjs";
import Constants from "~/application/Constants";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import RowFiltersHelper from "../helpers/RowFiltersHelper";

export type UserSimple = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};
export type UserWithoutPassword = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  admin?: AdminUser | null;
  defaultTenantId: string | null;
  createdAt: Date;
};

export type UserWithDetails = UserWithoutPassword & {
  admin: AdminUser | null;
  tenants: (TenantUser & { tenant: Tenant })[];
  roles: (UserRole & { role: Role })[];
};

export const includeSimpleUser = {
  user: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
};

export const includeSimpleCreatedByUser = {
  createdByUser: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
};

export const includeCreatedBy = {
  byUser: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
  byApiKey: {
    select: { id: true, alias: true },
  },
  byEmail: {
    select: { id: true, subject: true },
  },
  byEventWebhookAttempt: {
    select: { id: true, endpoint: true, message: true },
  },
};

export async function adminGetAllTenantUsers(tenantId: string): Promise<UserWithDetails[]> {
  return db.user.findMany({
    where: {
      tenants: {
        some: {
          tenantId,
        },
      },
    },
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function adminGetAllUsers(
  filters?: FiltersDto,
  pagination?: { page: number; pageSize: number }
): Promise<{ items: UserWithDetails[]; pagination: PaginationDto }> {
  let where = RowFiltersHelper.getFiltersCondition(filters);
  const tenantId = filters?.properties.find((f) => f.name === "tenantId")?.value ?? filters?.query ?? "";
  if (tenantId) {
    where = {
      OR: [where, { tenants: { some: { tenantId } } }],
    };
  }
  const items = await db.user.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    where,
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
  const totalItems = await db.user.count({
    where,
  });
  return {
    items,
    pagination: {
      page: pagination?.page ?? 1,
      pageSize: pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
    },
  };
}

export async function getUsersById(ids: string[]): Promise<UserWithDetails[]> {
  return db.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getUsersByTenant(tenantId: string | null): Promise<UserWithDetails[]> {
  let where = {};
  if (tenantId) {
    where = {
      tenants: {
        some: {
          tenantId,
        },
      },
    };
  } else {
    where = {
      admin: {
        isNot: null,
      },
    };
  }
  return db.user.findMany({
    where,
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getUser(userId?: string): Promise<UserWithoutPassword | null> {
  if (!userId) {
    return null;
  }
  return await db.user.findUnique({
    where: { id: userId },
    include: {
      admin: true,
    },
  });
}

export async function getUserByEmail(email?: string) {
  if (!email) {
    return null;
  }
  return await db.user.findUnique({
    where: { email },
    include: {
      tenants: true,
      admin: true,
    },
  });
}

export async function register(email: string, password: string, firstName: string, lastName: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      avatar: "",
      phone: "",
    },
  });
  return { id: user.id, email, defaultTenantId: "" };
}

export async function updateUserProfile(data: { firstName: string; lastName: string; avatar: string }, userId?: string) {
  if (!userId) {
    return null;
  }
  return await db.user.update({
    where: { id: userId },
    data,
  });
}

export async function updateUserVerifyToken(data: { verifyToken: string }, userId?: string) {
  if (!userId) {
    return null;
  }
  return await db.user.update({
    where: { id: userId },
    data,
  });
}

export async function updateUserPassword(data: { passwordHash: string }, userId?: string) {
  if (!userId) {
    return null;
  }
  return await db.user.update({
    where: { id: userId },
    data: {
      ...data,
      verifyToken: "",
    },
  });
}

export async function updateUserDefaultTenantId(data: { defaultTenantId: string }, userId: string) {
  if (!userId) {
    return null;
  }
  return await db.user.update({
    where: { id: userId },
    data,
  });
}

export async function deleteUser(userId: string) {
  return await db.user.delete({
    where: { id: userId },
  });
}

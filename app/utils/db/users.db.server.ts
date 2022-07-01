import { AdminUser, Role, Tenant, TenantUser, UserRole } from ".prisma/client";
import bcrypt from "bcryptjs";
import { db } from "~/utils/db.server";

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

export async function adminGetAllUsers(): Promise<UserWithDetails[]> {
  return db.user.findMany({
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

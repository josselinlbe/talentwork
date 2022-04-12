import { AdminUser, Tenant, User, UserEvent, Workspace } from ".prisma/client";
import bcrypt from "bcryptjs";
import { db } from "~/utils/db.server";
import { TenantUrl } from "../services/urlService";
import { getUserInfo } from "../session.server";

export type UserWithoutPassword = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
  admin?: AdminUser | null;
  defaultWorkspaceId: string | null;
};

export type UserEventWithDetails = UserEvent & {
  user: User;
  workspace?: Workspace | null;
  tenant?: Tenant | null;
};

export async function adminGetAllTenantUsers(tenantId: string) {
  return db.user.findMany({
    where: {
      tenants: {
        every: {
          tenantId,
        },
      },
    },
    include: {
      tenants: {
        include: {
          tenant: true,
        },
      },
    },
  });
}

export async function adminGetAllUsers() {
  return db.user.findMany({
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
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
  return { id: user.id, email, defaultWorkspaceId: "" };
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

export async function updateUserDefaultWorkspaceId(data: { defaultWorkspaceId: string }, userId: string) {
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

export async function getAllUserEvents(): Promise<UserEventWithDetails[]> {
  return await db.userEvent.findMany({
    include: {
      user: true,
      workspace: true,
      tenant: true,
    },
  });
}

export async function getUserEvents(tenantId: string): Promise<UserEventWithDetails[]> {
  return await db.userEvent.findMany({
    where: {
      tenantId,
    },
    include: {
      user: true,
      workspace: true,
      tenant: true,
    },
  });
}

export async function createUserEvent(request: Request, tenantUrl: TenantUrl, action: string, details: string) {
  const userInfo = await getUserInfo(request);

  await db.userEvent.create({
    data: {
      tenantId: tenantUrl.tenantId,
      workspaceId: tenantUrl.workspaceId,
      userId: userInfo.userId,
      url: request.url.toString(),
      action,
      details,
    },
  });
}

export async function createAdminUserEvent(request: Request, action: string, details: string) {
  const userInfo = await getUserInfo(request);
  await db.userEvent.create({
    data: {
      userId: userInfo.userId,
      url: request.url.toString(),
      action,
      details,
    },
  });
}

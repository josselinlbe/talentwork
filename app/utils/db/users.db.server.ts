import bcrypt from "bcryptjs";
import { UserType } from "~/application/enums/users/UserType";
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
  type: UserType;
  defaultWorkspaceId: string | null;
};

export async function adminGetAllUsers() {
  return db.user.findMany({
    include: {
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
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      phone: true,
      type: true,
      defaultWorkspaceId: true,
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
    },
  });
}

export async function register(email: string, password: string, firstName: string, lastName: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      type: UserType.Tenant,
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

export async function createUserActivityLog(session: { tenantUrl: TenantUrl; userId: string }, title: string, description: string) {
  db.userActivity.create({
    data: {
      tenantId: session.tenantUrl.tenantId,
      workspaceId: session.tenantUrl.workspaceId,
      userId: session.userId,
      title,
      description,
    },
  });
}

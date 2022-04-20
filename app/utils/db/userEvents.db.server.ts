import { Tenant, User, UserEvent } from "@prisma/client";
import { getClientIPAddress } from "remix-utils";
import { db } from "../db.server";
// import { jitsu } from "../jitsu.server";
import { TenantUrl } from "../services/urlService";
import { getUserInfo } from "../session.server";

export type UserEventWithDetails = UserEvent & {
  user: User;
  tenant?: Tenant | null;
};

export async function getAllUserEvents(): Promise<UserEventWithDetails[]> {
  return await db.userEvent.findMany({
    include: {
      user: true,
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
      tenant: true,
    },
  });
}

export async function createUserEvent(request: Request, tenantUrl: TenantUrl, action: string, details: string) {
  const userInfo = await getUserInfo(request);
  await db.userEvent.create({
    data: {
      tenantId: tenantUrl.tenantId,
      userId: userInfo.userId,
      url: new URL(request.url).pathname,
      action,
      details,
    },
  });
}

export async function createUserEventLogin(request: Request, user: User) {
  // eslint-disable-next-line no-console
  console.log({clientIpAddress: getClientIPAddress(request.headers)})
  // jitsu
  //   .id({
  //     email: user.email,
  //     internal_id: user.id,
  //   })
  //   .catch(() => {
  //     // console.error(error);
  //   });

  await db.userEvent.create({
    data: {
      userId: user.id,
      url: "",
      action: "Login",
      details: "",
    },
  });
}

export async function createUserEventLogout(request: Request, userId: string) {
  // jitsu
  //   .id({
  //     email: "",
  //     internal_id: "",
  //   })
  //   .catch(() => {
  //     // console.error(error);
  //   });
  await db.userEvent.create({
    data: {
      userId,
      url: "",
      action: "Login",
      details: "",
    },
  });
}

export async function createAdminUserEvent(request: Request, action: string, details: string) {
  const userInfo = await getUserInfo(request);
  await db.userEvent.create({
    data: {
      userId: userInfo.userId,
      url: new URL(request.url).pathname,
      action,
      details,
    },
  });
}

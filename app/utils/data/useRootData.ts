import { json, useMatches } from "remix";
import { getUser, UserWithoutPassword } from "../db/users.db.server";
import { getUserInfo, UserSession } from "../session.server";

export type AppRootData = {
  title: string;
  userSession: UserSession;
  authenticated: boolean;
  isAdmin: boolean;
  debug: boolean;
  chatWebsiteId?: string;
};

export function useRootData(): AppRootData {
  return (useMatches().find((f) => f.pathname === "/" || f.pathname === "")?.data ?? {}) as AppRootData;
}

export async function loadRootData(request: Request) {
  const userSession = await getUserInfo(request);
  const user: UserWithoutPassword | null = userSession.userId ? await getUser(userSession.userId) : null;
  const data: AppRootData = {
    title: `${process.env.APP_NAME}`,
    userSession,
    isAdmin: user?.admin !== null,
    authenticated: userSession.userId?.length > 0,
    debug: process.env.NODE_ENV === "development",
    chatWebsiteId: process.env.CRISP_CHAT_WEBSITE_ID?.toString(),
  };
  return json(data);
}

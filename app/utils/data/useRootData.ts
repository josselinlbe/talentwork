import { json, useMatches } from "remix";
import { getUserInfo, UserSession } from "../session.server";

export type AppRootData = {
  title: string;
  userSession: UserSession;
  debug: boolean;
};

export function useRootData(): AppRootData {
  return (useMatches().find((f) => f.pathname === "/" || f.pathname === "")?.data ?? {}) as AppRootData;
}

export async function loadRootData(request: Request) {
  const userSession = await getUserInfo(request);
  const data: AppRootData = {
    title: `${process.env.APP_NAME}`,
    userSession,
    debug: process.env.NODE_ENV === "development",
  };
  return json(data);
}

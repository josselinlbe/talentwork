import { json, useMatches } from "remix";
import { getUserInfo } from "../session.server";

export type AppRootData = {
  title: string;
  lng: string;
  lightOrDarkMode: string;
  debug: boolean;
};

export function useRootData(): AppRootData {
  return (useMatches().find((f) => f.pathname === "/" || f.pathname === "")?.data ?? {}) as AppRootData;
}

export async function loadRootData(request: Request) {
  const userInfo = await getUserInfo(request);
  const data: AppRootData = {
    title: `${process.env.APP_NAME}`,
    lightOrDarkMode: userInfo?.lightOrDarkMode ?? "dark",
    lng: userInfo.lng,
    debug: process.env.NODE_ENV === "development",
  };
  return json(data);
}

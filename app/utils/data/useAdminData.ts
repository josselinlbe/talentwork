import { redirect, useMatches } from "remix";
import { Language } from "remix-i18next";
import { getUserInfo } from "../session.server";
import { getUser } from "../db/users.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { UserType } from "~/application/enums/users/UserType";
import UrlUtils from "../app/UrlUtils";
import { Params } from "react-router";

export type AdminLoaderData = {
  i18n: Record<string, Language>;
  user: Awaited<ReturnType<typeof getUser>>;
};

export function useAdminData(): AdminLoaderData {
  const paths: string[] = ["routes/admin"];
  return (useMatches().find((f) => paths.includes(f.id.toLowerCase()))?.data ?? {}) as AdminLoaderData;
}

export async function loadAdminData(request: Request, params: Params) {
  const { translations } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === `/admin`) {
    throw redirect(`/admin/tenants`);
  }
  const user = await getUser(userInfo?.userId);
  const redirectTo = new URL(request.url).pathname;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  if (user.type !== UserType.Admin) {
    throw redirect(`/unauthorized`);
  }

  const data: AdminLoaderData = {
    i18n: translations,
    user,
  };
  return data;
}

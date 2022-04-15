import { redirect, useMatches } from "remix";
import { Language } from "remix-i18next";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { getUserInfo } from "../session.server";
import { Tenant } from "@prisma/client";
import { getTenantRelationshipsCount } from "../db/tenantRelationships.db.server";
import { TenantRelationshipStatus } from "~/application/enums/tenants/TenantRelationshipStatus";
import { getMyTenants, getTenant, MyTenant } from "../db/tenants.db.server";
import { getUser, UserWithoutPassword } from "../db/users.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { Params } from "react-router";
import UrlUtils from "../app/UrlUtils";
import { getTenantUrl } from "../services/urlService";
import { getTenantSubscription, TenantSubscriptionWithDetails } from "../db/tenantSubscriptions.db.server";

export type AppLoaderData = {
  i18n: Record<string, Language>;
  user: UserWithoutPassword;
  myTenants: MyTenant[];
  currentTenant: Tenant;
  mySubscription: TenantSubscriptionWithDetails | null;
  currentRole: TenantUserRole;
  isOwnerOrAdmin: boolean;
  pendingInvitations: number;
};

export function useAppData(): AppLoaderData {
  const paths: string[] = ["routes/app.$tenant", "routes/app"];
  return (useMatches().find((f) => paths.includes(f.id.toLowerCase()))?.data ?? {}) as AppLoaderData;
}

export async function loadAppData(request: Request, params: Params) {
  const tenantUrl = await getTenantUrl(params);

  const { translations } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);

  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === UrlUtils.stripTrailingSlash(UrlUtils.currentTenantUrl(params))) {
    throw redirect(UrlUtils.currentTenantUrl(params, "dashboard"));
  }
  const user = await getUser(userInfo?.userId);
  const redirectTo = new URL(request.url).pathname;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  const currentTenant = await getTenant(tenantUrl.tenantId);
  if (!currentTenant) {
    throw redirect(`/app`);
  }

  const myTenants = await getMyTenants(user.id);
  const tenantMembership = myTenants.find((f) => f.tenantId === tenantUrl.tenantId);

  const mySubscription = await getTenantSubscription(tenantUrl.tenantId);

  let currentRole = tenantMembership?.role ?? TenantUserRole.MEMBER;
  if (user.admin) {
    currentRole = TenantUserRole.ADMIN;
  }
  const isOwnerOrAdmin = currentRole == TenantUserRole.OWNER || currentRole == TenantUserRole.ADMIN;

  const pendingInvitations = await getTenantRelationshipsCount(tenantUrl.tenantId, [TenantRelationshipStatus.PENDING]);
  const data: AppLoaderData = {
    i18n: translations,
    user,
    myTenants,
    currentTenant,
    currentRole,
    mySubscription,
    isOwnerOrAdmin,
    pendingInvitations,
  };
  return data;
}

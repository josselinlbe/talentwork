import { redirect, useMatches } from "remix";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { getUserInfo } from "../session.server";
import { getLinkedAccountsCount } from "../db/linkedAccounts.db.server";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { getMyTenants, getTenant, MyTenant } from "../db/tenants.db.server";
import { getUser, UserWithoutPassword } from "../db/users.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "../app/UrlUtils";
import { getTenantUrl } from "../services/urlService";
import { getTenantSubscription, TenantSubscriptionWithDetails } from "../db/tenantSubscriptions.db.server";
import { getAllEntities } from "../db/entities/entities.db.server";
import { Tenant, Entity } from "@prisma/client";
import { Language } from "remix-i18next";
import { Params } from "react-router";

export type AppLoaderData = {
  i18n: Record<string, Language>;
  user: UserWithoutPassword;
  myTenants: MyTenant[];
  currentTenant: Tenant;
  mySubscription: TenantSubscriptionWithDetails | null;
  currentRole: TenantUserType;
  isOwnerOrAdmin: boolean;
  pendingInvitations: number;
  entities: Entity[];
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

  let currentRole = tenantMembership?.type ?? TenantUserType.MEMBER;
  if (user.admin) {
    currentRole = TenantUserType.ADMIN;
  }
  const isOwnerOrAdmin = currentRole == TenantUserType.OWNER || currentRole == TenantUserType.ADMIN;

  const pendingInvitations = await getLinkedAccountsCount(tenantUrl.tenantId, [LinkedAccountStatus.PENDING]);

  const mySubscription = await getTenantSubscription(tenantUrl.tenantId);

  const data: AppLoaderData = {
    i18n: translations,
    user,
    myTenants,
    currentTenant,
    currentRole,
    mySubscription,
    isOwnerOrAdmin,
    pendingInvitations,
    entities: await getAllEntities(true),
  };
  return data;
}

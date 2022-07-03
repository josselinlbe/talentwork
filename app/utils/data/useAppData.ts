import { redirect } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { getUserInfo } from "../session.server";
import { getLinkedAccountsCount } from "../db/linkedAccounts.db.server";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { getMyTenants, getTenant } from "../db/tenants.db.server";
import { getUser } from "../db/users.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "../app/UrlUtils";
import { getTenantUrl } from "../services/urlService";
import { getTenantSubscription, TenantSubscriptionWithDetails } from "../db/tenantSubscriptions.db.server";
import { getAllEntities } from "../db/entities/entities.db.server";
import { Tenant } from "@prisma/client";
import { Params } from "react-router";
import { getUserRoles } from "../db/permissions/userRoles.db.server";
import { getMyGroups } from "../db/permissions/groups.db.server";
import { getAllRoles } from "../db/permissions/roles.db.server";
import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import { AppOrAdminData } from "./useAppOrAdminData";

export type AppLoaderData = AppOrAdminData & {
  currentTenant: Tenant;
  mySubscription: TenantSubscriptionWithDetails | null;
  currentRole: TenantUserType;
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

  let currentRole = tenantMembership?.type ?? TenantUserType.MEMBER;
  if (user.admin) {
    currentRole = TenantUserType.ADMIN;
  }
  const pendingInvitations = await getLinkedAccountsCount(tenantUrl.tenantId, [LinkedAccountStatus.PENDING]);

  const mySubscription = await getTenantSubscription(tenantUrl.tenantId);

  const roles = await getUserRoles(userInfo.userId, tenantUrl.tenantId);
  const permissions: string[] = [];
  roles.forEach((role) => {
    role.role.permissions.forEach((permission) => {
      if (!permissions.includes(permission.permission.name)) {
        permissions.push(permission.permission.name);
      }
    });
  });
  const data: AppLoaderData = {
    i18n: translations,
    user,
    myTenants,
    currentTenant,
    currentRole,
    mySubscription,
    pendingInvitations,
    entities: await getAllEntities(true, false),
    allRoles: await getAllRoles("app"),
    roles,
    permissions,
    myGroups: await getMyGroups(user.id, currentTenant.id),
    isSuperUser: roles.find((f) => f.role.name === DefaultAppRoles.SuperUser) !== undefined,
  };
  return data;
}

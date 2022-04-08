import { redirect, useMatches } from "remix";
import { Language } from "remix-i18next";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { getUserInfo } from "../session.server";
import { SubscriptionPrice, SubscriptionProduct, Tenant } from "@prisma/client";
import { getStripeSubscription } from "../stripe.server";
import { getLinksCount } from "../db/links.db.server";
import { LinkStatus } from "~/application/enums/links/LinkStatus";
import { getSubscriptionPriceByStripeId, SubscriptionPriceWithProduct } from "../db/subscriptionProducts.db.server";
import { getMyTenants, getTenant, MyTenant } from "../db/tenants.db.server";
import { getUser, UserWithoutPassword } from "../db/users.db.server";
import { getMyWorkspaces, getWorkspace, getWorkspaceUser, MyWorkspace, WorkspaceWithUsers } from "../db/workspaces.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { Params } from "react-router";
import UrlUtils from "../app/UrlUtils";
import { UserType } from "~/application/enums/users/UserType";
import { getTenantUrl } from "../services/urlService";

export type AppLoaderData = {
  i18n: Record<string, Language>;
  user: UserWithoutPassword;
  myTenants: MyTenant[];
  currentTenant: Tenant;
  myWorkspaces: MyWorkspace[];
  currentWorkspace: WorkspaceWithUsers;
  mySubscription: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null;
  currentRole: TenantUserRole;
  isOwnerOrAdmin: boolean;
  pendingInvitations: number;
};

export function useAppData(): AppLoaderData {
  const paths: string[] = ["routes/app.$tenant.$workspace", "routes/app"];
  return (useMatches().find((f) => paths.includes(f.id.toLowerCase()))?.data ?? {}) as AppLoaderData;
}

export async function loadAppData(request: Request, params: Params) {
  const tenantUrl = await getTenantUrl(params);

  const { translations } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === UrlUtils.currentTenantUrl(params)) {
    throw redirect(UrlUtils.currentTenantUrl(params, "dashboard"));
  }
  const user = await getUser(userInfo?.userId);
  const redirectTo = new URL(request.url).pathname;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  const currentWorkspaceMembership = await getWorkspaceUser(tenantUrl.workspaceId, userInfo.userId);
  if (!currentWorkspaceMembership) {
    // No longer a workspace member
    // TODO
    // tenantUrl.workspaceId = "";
    // const userWorkspaces = await getMyWorkspaces(userInfo.userId, tenantId);
    // if (userWorkspaces.length > 0) {
    //   tenantUrl.workspaceId = userWorkspaces[0].workspace.id;
    // }
    // throw createUserSession(userInfo, redirectTo);
  }

  const currentTenant = await getTenant(tenantUrl.tenantId);
  const currentWorkspace = await getWorkspace(tenantUrl.workspaceId);
  if (!currentTenant || !currentWorkspace) {
    throw redirect(`/app`);
  }

  const myTenants = await getMyTenants(user.id);
  const myWorkspaces = await getMyWorkspaces(user.id, currentTenant?.id);
  const tenantMembership = myTenants.find((f) => f.tenantId === tenantUrl.tenantId);

  const stripeSubscription = await getStripeSubscription(currentTenant?.subscriptionId ?? "");
  let mySubscription: SubscriptionPriceWithProduct | null = null;
  if (stripeSubscription && stripeSubscription?.items.data.length > 0) {
    mySubscription = await getSubscriptionPriceByStripeId(stripeSubscription?.items.data[0].plan.id);
  }

  let currentRole = tenantMembership?.role ?? TenantUserRole.GUEST;
  if (user.type === UserType.Admin) {
    currentRole = TenantUserRole.ADMIN;
  }
  const isOwnerOrAdmin = currentRole == TenantUserRole.OWNER || currentRole == TenantUserRole.ADMIN;

  const pendingInvitations = await getLinksCount(tenantUrl.workspaceId ?? "", [LinkStatus.PENDING]);
  const data: AppLoaderData = {
    i18n: translations,
    user,
    myTenants,
    currentTenant,
    myWorkspaces,
    currentWorkspace,
    currentRole,
    mySubscription,
    isOwnerOrAdmin,
    pendingInvitations,
  };
  return data;
}

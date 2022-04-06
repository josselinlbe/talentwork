import { redirect, useMatches } from "remix";
import { Language } from "remix-i18next";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { getUserInfo } from "../session.server";
import { SubscriptionPrice, SubscriptionProduct } from "@prisma/client";
import { getStripeSubscription } from "../stripe.server";
import { getLinksCount } from "../db/links.db.server";
import { LinkStatus } from "~/application/enums/links/LinkStatus";
import { getSubscriptionPriceByStripeId, SubscriptionPriceWithProduct } from "../db/subscriptionProducts.db.server";
import { getMyTenants, getTenant } from "../db/tenants.db.server";
import { getUser } from "../db/users.db.server";
import { getMyWorkspaces, getWorkspace, getWorkspaceUser } from "../db/workspaces.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { Params } from "react-router";
import UrlUtils from "../app/UrlUtils";

export type AppLoaderData = {
  i18n: Record<string, Language>;
  user: Awaited<ReturnType<typeof getUser>>;
  myTenants: Awaited<ReturnType<typeof getMyTenants>>;
  currentTenant: Awaited<ReturnType<typeof getTenant>>;
  myWorkspaces: Awaited<ReturnType<typeof getMyWorkspaces>>;
  currentWorkspace: Awaited<ReturnType<typeof getWorkspace>>;
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
  const { translations } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === `/app/${params.tenant}/${params.workspace}`) {
    throw redirect(UrlUtils.appUrl(params, "dashboard"));
  }
  const user = await getUser(userInfo?.userId);
  const redirectTo = new URL(request.url).pathname;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  const currentWorkspaceMembership = await getWorkspaceUser(params.workspace, userInfo.userId);
  if (!currentWorkspaceMembership) {
    // No longer a workspace member
    // TODO
    // params.workspace = "";
    // const userWorkspaces = await getMyWorkspaces(userInfo.userId, userInfo.currentTenantId);
    // if (userWorkspaces.length > 0) {
    //   params.workspace = userWorkspaces[0].workspace.id;
    // }
    // throw createUserSession(userInfo, redirectTo);
  }

  const currentTenant = await getTenant(params.tenant);
  const currentWorkspace = await getWorkspace(params.workspace);
  if (!currentTenant || !currentWorkspace) {
    throw redirect(`/app`);
  }

  const myTenants = await getMyTenants(user.id);
  const myWorkspaces = await getMyWorkspaces(user.id, currentTenant?.id);
  const tenantMembership = myTenants.find((f) => f.tenantId === params.tenant);

  const stripeSubscription = await getStripeSubscription(currentTenant?.subscriptionId ?? "");
  let mySubscription: SubscriptionPriceWithProduct | null = null;
  if (stripeSubscription && stripeSubscription?.items.data.length > 0) {
    mySubscription = await getSubscriptionPriceByStripeId(stripeSubscription?.items.data[0].plan.id);
  }

  const currentRole = tenantMembership?.role ?? TenantUserRole.GUEST;
  const isOwnerOrAdmin = currentRole == TenantUserRole.OWNER || currentRole == TenantUserRole.ADMIN;

  const pendingInvitations = await getLinksCount(params.workspace ?? "", [LinkStatus.PENDING]);
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

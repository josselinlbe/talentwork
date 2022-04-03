import { useMatches } from "remix";
import { LinkStatus } from "~/application/enums/links/LinkStatus";
import { getClientLinksCount, getLinksCount, getProviderLinksCount } from "../db/links.db.server";
import { getUserInfo } from "../session.server";
import { getTenantUsersCount } from "../db/tenants.db.server";
import { getWorkspacesCount } from "../db/workspaces.db.server";
import { getMonthlyContractsCount } from "~/modules/contracts/db/contracts.db.server";
import { getEmployeesCount } from "~/modules/contracts/db/employees.db.server";

export type DashboardLoaderData = {
  users: number;
  workspaces: number;
  clients: number;
  providers: number;
  employees: number;
  contracts: number;
  storage: number;
  pendingInvitations: number;
};

export function useDashboardData(): DashboardLoaderData {
  return (useMatches().find((f) => f.pathname === "/app/dashboard" || f.pathname === "/admin")?.data ?? {}) as DashboardLoaderData;
}

export async function loadDashboardData(request: Request) {
  const userInfo = await getUserInfo(request);
  const data: DashboardLoaderData = {
    users: await getTenantUsersCount(userInfo.currentTenantId),
    workspaces: await getWorkspacesCount(userInfo.currentTenantId),
    clients: await getClientLinksCount(userInfo.currentTenantId),
    providers: await getProviderLinksCount(userInfo.currentTenantId),
    employees: await getEmployeesCount(userInfo.currentTenantId),
    contracts: await getMonthlyContractsCount(userInfo.currentTenantId),
    storage: 10, // TODO: Implement your own storage limit
    pendingInvitations: await getLinksCount(userInfo.currentWorkspaceId, [LinkStatus.PENDING]),
  };
  return data;
}

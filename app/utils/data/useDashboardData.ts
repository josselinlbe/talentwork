import { useMatches } from "remix";
import { LinkStatus } from "~/application/enums/links/LinkStatus";
import { getClientLinksCount, getLinksCount, getProviderLinksCount } from "../db/links.db.server";
import { getTenantUsersCount } from "../db/tenants.db.server";
import { getWorkspacesCount } from "../db/workspaces.db.server";
import { getMonthlyContractsCount } from "~/modules/contracts/db/contracts.db.server";
import { getEmployeesCount } from "~/modules/contracts/db/employees.db.server";
import { Params } from "react-router";
import { getTenantUrl } from "../services/urlService";

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
  return (useMatches().find((f) => f.id === "routes/app.$tenant.$workspace/dashboard")?.data ?? {}) as DashboardLoaderData;
}

export async function loadDashboardData(params: Params) {
  const tenantUrl = await getTenantUrl(params);
  const data: DashboardLoaderData = {
    users: await getTenantUsersCount(tenantUrl.tenantId),
    workspaces: await getWorkspacesCount(tenantUrl.tenantId),
    clients: await getClientLinksCount(tenantUrl.tenantId),
    providers: await getProviderLinksCount(tenantUrl.tenantId),
    employees: await getEmployeesCount(tenantUrl.tenantId),
    contracts: await getMonthlyContractsCount(tenantUrl.tenantId),
    storage: 10, // TODO: Implement your own storage limit
    pendingInvitations: await getLinksCount(tenantUrl.workspaceId, [LinkStatus.PENDING]),
  };
  return data;
}

import { useMatches } from "remix";
import { LinkStatus } from "~/application/enums/links/LinkStatus";
import { getClientLinksCount, getLinksCount, getProviderLinksCount } from "../db/links.db.server";
import { getTenantUsersCount } from "../db/tenants.db.server";
import { getWorkspacesCount } from "../db/workspaces.db.server";
import { getMonthlyContractsCount } from "~/modules/contracts/db/contracts.db.server";
import { getEmployeesCount } from "~/modules/contracts/db/employees.db.server";
import { Params } from "react-router";

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
  const tenant = params.tenant ?? "";
  const workspace = params.workspace ?? "";
  const data: DashboardLoaderData = {
    users: await getTenantUsersCount(tenant),
    workspaces: await getWorkspacesCount(tenant),
    clients: await getClientLinksCount(tenant),
    providers: await getProviderLinksCount(tenant),
    employees: await getEmployeesCount(tenant),
    contracts: await getMonthlyContractsCount(tenant),
    storage: 10, // TODO: Implement your own storage limit
    pendingInvitations: await getLinksCount(workspace, [LinkStatus.PENDING]),
  };
  return data;
}

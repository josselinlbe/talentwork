import { useMatches } from "remix";
import { TenantRelationshipStatus } from "~/application/enums/tenants/TenantRelationshipStatus";
import { getClientLinksCount, getTenantRelationshipsCount, getProviderLinksCount } from "../db/tenantRelationships.db.server";
import { getTenantUsersCount } from "../db/tenants.db.server";
import { getMonthlyContractsCount } from "~/modules/contracts/db/contracts.db.server";
import { getEmployeesCount } from "~/modules/contracts/db/employees.db.server";
import { Params } from "react-router";
import { getTenantUrl } from "../services/urlService";

export type DashboardLoaderData = {
  users: number;
  clients: number;
  providers: number;
  employees: number;
  contracts: number;
  storage: number;
  pendingInvitations: number;
};

export function useDashboardData(): DashboardLoaderData {
  return (useMatches().find((f) => f.id === "routes/app.$tenant/dashboard")?.data ?? {}) as DashboardLoaderData;
}

export async function loadDashboardData(params: Params) {
  const tenantUrl = await getTenantUrl(params);
  const data: DashboardLoaderData = {
    users: await getTenantUsersCount(tenantUrl.tenantId),
    clients: await getClientLinksCount(tenantUrl.tenantId),
    providers: await getProviderLinksCount(tenantUrl.tenantId),
    employees: await getEmployeesCount(tenantUrl.tenantId),
    contracts: await getMonthlyContractsCount(tenantUrl.tenantId),
    storage: 10, // TODO: Implement your own storage limit
    pendingInvitations: await getTenantRelationshipsCount(tenantUrl.tenantId, [TenantRelationshipStatus.PENDING]),
  };
  return data;
}

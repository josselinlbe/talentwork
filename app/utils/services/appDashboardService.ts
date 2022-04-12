import { Stat } from "~/application/dtos/stats/Stat";
import { getContractsStat, getEmployeesStat, getLinksStat } from "~/modules/contracts/dashboard/contractsDashboardService";

export async function getAppDashboardStats(tenantId: string, lastDays: number): Promise<Stat[]> {
  const linksStat = await getLinksStat(tenantId, lastDays);
  const contractsStat = await getContractsStat(tenantId, lastDays);
  const employeesStat = await getEmployeesStat(tenantId, lastDays);
  return Promise.resolve([linksStat, contractsStat, employeesStat]);
}

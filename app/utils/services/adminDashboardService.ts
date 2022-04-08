import { Stat } from "~/application/dtos/stats/Stat";
import { getStatChangeType } from "../app/DashboardUtils";
import { db } from "../db.server";
import DateUtils from "../shared/DateUtils";

export async function getAdminDashboardStats(lastDays: number): Promise<Stat[]> {
  const tenantStat = await getTenantStat(lastDays);
  const mrrStat = await getMMRStat(lastDays);
  const activeUsersStat = await getActiveUsersStat(lastDays);
  return Promise.resolve([tenantStat, mrrStat, activeUsersStat]);
}

async function getTenantStat(lastDays: number) {
  const { added, total } = await getTenantsCreatedSince(lastDays);
  const tenantStat: Stat = {
    name: "Tenants",
    hint: "Total accounts",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: "+" + added.toString(),
    changeType: getStatChangeType(added, total),
    path: "/admin/tenants",
  };
  return tenantStat;
}

async function getMMRStat(lastDays: number) {
  const tenantStat: Stat = {
    name: "MRR",
    hint: "Monthly recurring revenue",
    stat: "$29,900",
    previousStat: "$23,920",
    change: "15%",
    changeType: getStatChangeType(29900 - 23920, 29900),
    path: "https://dashboard.stripe.com/",
  };
  return tenantStat;
}

async function getActiveUsersStat(lastDays: number) {
  const activeUsersStat: Stat = {
    name: "MAU",
    hint: "Monthly active users",
    stat: "30",
    previousStat: "45",
    change: "33.40%",
    changeType: getStatChangeType(-15, 30),
    path: "/admin/users",
  };
  return activeUsersStat;
}

async function getTenantsCreatedSince(lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays);
  const added = await db.tenant.count({
    where: {
      createdAt: {
        gte: from,
      },
    },
  });
  const total = await db.tenant.count();

  return {
    added,
    total,
  };
}

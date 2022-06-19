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
    path: "/admin/accounts",
  };
  return tenantStat;
}

async function getMMRStat(lastDays: number) {
  // const { added, total } = await getTenantsCreatedSince(lastDays);
  const tenantStat: Stat = {
    name: "MRR",
    hint: "Monthly recurring revenue",
    stat: "TODO",
    previousStat: "TODO",
    change: "TODO",
    changeType: getStatChangeType(0, 0),
    path: "TODO",
  };
  return tenantStat;
}

async function getActiveUsersStat(lastDays: number) {
  const { added, total } = await getLogsCreatedSince(lastDays);
  const activeUsersStat: Stat = {
    name: "MAU",
    hint: "Monthly active users",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: "+" + added.toString(),
    changeType: getStatChangeType(added, total),
  };
  return activeUsersStat;
}

async function getLogsCreatedSince(lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays * -1);
  const added = await db.log.groupBy({
    by: ["userId"],
    where: {
      createdAt: {
        gte: from,
      },
    },
  });
  const total = await db.log.groupBy({
    by: ["userId"],
  });

  return {
    added: added.length,
    total: total.length,
  };
}

async function getTenantsCreatedSince(lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays * -1);
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

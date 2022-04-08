import { Stat } from "~/application/dtos/stats/Stat";
import { getStatChangePercentage, getStatChangeType } from "../app/DashboardUtils";
import { db } from "../db.server";
import DateUtils from "../shared/DateUtils";

export async function getAppDashboardStats(lastDays: number): Promise<Stat[]> {
  const contractsStat = await getContractsStat(lastDays);
  const mrrStat = await getMMRStat(lastDays);
  const activeUsersStat = await getActiveUsersStat(lastDays);
  return Promise.resolve([contractsStat, mrrStat, activeUsersStat]);
}

async function getContractsStat(lastDays: number) {
  const { total, added } = await getContractsCreatedSince(lastDays);

  const contractsStat: Stat = {
    name: "Contracts",
    hint: "Total contracts",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: getStatChangePercentage(added, total) + "%",
    changeType: getStatChangeType(added, total),
    path: "contracts",
  };
  return contractsStat;
}

async function getMMRStat(lastDays: number) {
  const contractsStatsInfo = await getContractsCreatedSince(lastDays);
  const tenantStat: Stat = {
    name: "MRR",
    hint: "Monthly recurring revenue",
    stat: "$29,900",
    previousStat: "$23,920",
    change: "15%",
    changeType: getStatChangeType(0, 0),
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
    changeType: getStatChangeType(-1, 2),
    path: "/admin/users",
  };
  return activeUsersStat;
}

async function getContractsCreatedSince(lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays);
  const added = await db.contract.count({
    where: {
      createdAt: {
        gte: from,
      },
    },
  });
  const total = await db.contract.count();

  return {
    added,
    total,
  };
}

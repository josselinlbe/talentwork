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
    path: "/app/:tenant/:workspace/contracts",
  };
  return contractsStat;
}

async function getMMRStat(lastDays: number) {
  const contractsStatsInfo = await getContractsCreatedSince(lastDays);
  const tenantStat: Stat = {
    name: "TODO",
    hint: "...",
    stat: "...",
    previousStat: "...",
    change: "...",
    changeType: getStatChangeType(0, 1),
    path: "",
  };
  return tenantStat;
}

async function getActiveUsersStat(lastDays: number) {
  const activeUsersStat: Stat = {
    name: "TODO",
    hint: "...",
    stat: "...",
    previousStat: "...",
    change: "...",
    changeType: getStatChangeType(0, 1),
    path: "",
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

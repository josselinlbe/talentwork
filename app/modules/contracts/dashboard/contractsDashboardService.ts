import { Stat } from "~/application/dtos/stats/Stat";
import { getStatChangePercentage, getStatChangeType } from "~/utils/app/DashboardUtils";
import { db } from "~/utils/db.server";
import DateUtils from "~/utils/shared/DateUtils";

const linkCondition = (tenantId: string) => {
  return {
    OR: [
      {
        providerWorkspace: {
          tenantId,
        },
      },
      {
        clientWorkspace: {
          tenantId,
        },
      },
    ],
  };
};

export async function getLinksStat(tenantId: string, lastDays: number) {
  const { total, added } = await getLinksCreatedSince(tenantId, lastDays);

  const linksStat: Stat = {
    name: "Links",
    hint: "Created links",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: getStatChangePercentage(added, total) + "%",
    changeType: getStatChangeType(added, total),
    // path: "/app/:tenant/:workspace/contracts",
  };
  return linksStat;
}

async function getLinksCreatedSince(tenantId: string, lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays);
  const added = await db.link.count({
    where: {
      ...linkCondition(tenantId),
      createdAt: {
        gte: from,
      },
    },
  });
  const total = await db.link.count({
    where: {
      ...linkCondition(tenantId),
    },
  });

  return {
    added,
    total,
  };
}

export async function getContractsStat(tenantId: string, lastDays: number) {
  const { total, added } = await getContractsCreatedSince(tenantId, lastDays);

  const contractsStat: Stat = {
    name: "Contracts",
    hint: "Total contracts",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: getStatChangePercentage(added, total) + "%",
    changeType: getStatChangeType(added, total),
    // path: "/app/:tenant/:workspace/contracts",
  };
  return contractsStat;
}

async function getContractsCreatedSince(tenantId: string, lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays);
  const added = await db.contract.count({
    where: {
      link: {
        ...linkCondition(tenantId),
      },
      createdAt: {
        gte: from,
      },
    },
  });
  const total = await db.contract.count({
    where: {
      link: {
        ...linkCondition(tenantId),
      },
    },
  });

  return {
    added,
    total,
  };
}

export async function getEmployeesStat(tenantId: string, lastDays: number) {
  const { total, added } = await getEmployeesCreatedSince(tenantId, lastDays);

  const contractsStat: Stat = {
    name: "Employees",
    hint: "Total employees",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: getStatChangePercentage(added, total) + "%",
    changeType: getStatChangeType(added, total),
    // path: "/app/:tenant/:workspace/contracts",
  };
  return contractsStat;
}

async function getEmployeesCreatedSince(tenantId: string, lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays);
  const added = await db.employee.count({
    where: {
      tenantId,
      createdAt: {
        gte: from,
      },
    },
  });
  const total = await db.employee.count({
    where: {
      tenantId,
    },
  });

  return {
    added,
    total,
  };
}

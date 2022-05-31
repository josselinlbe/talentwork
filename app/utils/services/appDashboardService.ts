import { Entity } from "@prisma/client";
import { Stat } from "~/application/dtos/stats/Stat";
import { getStatChangePercentage, getStatChangeType } from "../app/DashboardUtils";
import { db } from "../db.server";
import { getAllEntities } from "../db/entities/entities.db.server";
import TenantHelper from "../helpers/TenantHelper";
import DateUtils from "../shared/DateUtils";

export async function getAppDashboardStats(tenantId: string, lastDays: number): Promise<Stat[]> {
  const entities = await getAllEntities(true);
  const stats: Stat[] = await Promise.all(
    entities.map(async (entity) => {
      return await getEntityStat(entity, tenantId, lastDays);
    })
  );
  return stats;
}

export async function getEntityStat(entity: Entity, tenantId: string, lastDays: number) {
  const { total, added } = await getRowsCreatedSince(entity.id, tenantId, lastDays);

  const stat: Stat = {
    name: entity.titlePlural,
    hint: "",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: getStatChangePercentage(added, total) + "%",
    changeType: getStatChangeType(added, total),
    path: "/app/:tenant/" + entity.slug,
  };
  return stat;
}

async function getRowsCreatedSince(entityId: string, tenantId: string, lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays * -1);
  const added = await db.row.count({
    where: {
      entityId,
      createdAt: {
        gte: from,
      },
      ...TenantHelper.tenantCondition(tenantId),
    },
  });
  const total = await db.row.count({
    where: {
      ...TenantHelper.tenantCondition(tenantId),
    },
  });

  return {
    added,
    total,
  };
}

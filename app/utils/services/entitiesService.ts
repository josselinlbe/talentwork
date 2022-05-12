import { EntityLimitType } from "~/application/enums/entities/EntityLimitType";
import { getEntityBySlug, getEntityRowsCount } from "../db/entities.db.server";
import { getMaxEntityRowFolio } from "../db/entityRows.db.server";
import { getTenantSubscription } from "../db/tenantSubscriptions.db.server";

export type EntityUsageAndLimit = {
  count: number;
  type: EntityLimitType;
  max: number;
};
export async function getEntityUsageAndLimit(slug: string, tenantId: string): Promise<EntityUsageAndLimit> {
  const contractsEntity = await getEntityBySlug(slug);
  const subscription = await getTenantSubscription(tenantId);
  const contractsLimit = subscription?.subscriptionPrice?.subscriptionProduct.entityLimits.find((f) => f.entityId === contractsEntity?.id);
  return {
    count: await getEntityRowsCount(tenantId, contractsEntity?.id ?? "", contractsLimit),
    type: contractsLimit?.type ?? EntityLimitType.MAX,
    max: contractsLimit?.max ?? 0,
  };
}

// export async function getNextEntityRowFolio(entityId: string) {
//   const maxFolio = await getMaxEntityRowFolio(entityId);
//   if (!maxFolio || maxFolio._max.folio === null) {
//     return 1;
//   }
//   return maxFolio._max.folio + 1;
// }

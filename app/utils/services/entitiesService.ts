import { EntityLimitType } from "~/application/enums/entities/EntityLimitType";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import { EntityPropertyWithDetails, EntityWithDetails, getEntityById, getEntityBySlug, getEntityRowsCount } from "../db/entities.db.server";
import { getEntityProperty } from "../db/entityProperties.db.server";
import { EntityRowWithDetails, getEntityRows, getMaxEntityRowFolio } from "../db/entityRows.db.server";
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

export async function getRelatedEntityRows(
  properties: EntityPropertyWithDetails[],
  tenantId: string
): Promise<{ propertyId: string; entity: EntityWithDetails; rows: EntityRowWithDetails[] }[]> {
  const relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: EntityRowWithDetails[] }[] = [];
  await Promise.all(
    properties
      .filter((f) => f.type === EntityPropertyType.ENTITY)
      .map(async (property) => {
        if (property.parentId !== null) {
          const parentProperty = await getEntityProperty(property.parentId);
          if (parentProperty) {
            const parentEntity = await getEntityById(parentProperty.entityId);
            if (parentEntity) {
              const rows = await getEntityRows(parentProperty.entityId, tenantId);
              relatedEntities.push({
                propertyId: property.id,
                entity: parentEntity,
                rows,
              });
              return rows;
            }
          }
        }
      })
  );
  return relatedEntities;
}

import { EntityLimitType } from "~/application/enums/entities/EntityLimitType";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PropertyWithDetails, EntityWithDetails, getEntityById } from "../db/entities/entities.db.server";
import { getProperty } from "../db/entities/properties.db.server";
import { RowWithDetails, getRows } from "../db/entities/rows.db.server";

export type EntityUsageAndLimit = {
  count: number;
  type: EntityLimitType;
  max: number;
};
// export async function getEntityUsageAndLimit(slug: string, tenantId: string): Promise<EntityUsageAndLimit> {
//   const contractsEntity = await getEntityBySlug(slug);
//   const subscription = await getTenantSubscription(tenantId);
//   const contractsLimit = subscription?.subscriptionPrice?.subscriptionProduct.entityLimits.find((f) => f.entityId === contractsEntity?.id);
//   return {
//     count: await getRowsCount(tenantId, contractsEntity?.id ?? "", contractsLimit),
//     type: contractsLimit?.type ?? EntityLimitType.MAX,
//     max: contractsLimit?.max ?? 0,
//   };
// }

// export async function getNextRowFolio(entityId: string) {
//   const maxFolio = await getMaxRowFolio(entityId);
//   if (!maxFolio || maxFolio._max.folio === null) {
//     return 1;
//   }
//   return maxFolio._max.folio + 1;
// }

export async function getRelatedRows(
  properties: PropertyWithDetails[],
  tenantId: string | null
): Promise<{ propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[]> {
  const relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[] = [];
  await Promise.all(
    properties
      .filter((f) => f.type === PropertyType.ENTITY)
      .map(async (property) => {
        if (property.parentId !== null) {
          const parentProperty = await getProperty(property.parentId);
          if (parentProperty) {
            const parentEntity = await getEntityById(parentProperty.entityId);
            if (parentEntity) {
              const rows = await getRows(parentProperty.entityId, tenantId);
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

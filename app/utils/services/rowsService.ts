import { db } from "../db.server";
import { getMaxRowFolio } from "../db/entities/rows.db.server";

export async function getCreateNewRow(entityName: string, createdByUserId: string, linkedAccountId: string | null = null, tenantId: string | null = null) {
  const entity = await db.entity.findUnique({ where: { name: entityName } });
  if (!entity) {
    throw new Error("Entity required: " + entityName);
  }
  let folio = 1;
  const maxFolio = await getMaxRowFolio(tenantId, entity.id);
  if (maxFolio && maxFolio._max.folio !== null) {
    folio = maxFolio._max.folio + 1;
  }
  return {
    row: {
      create: {
        entityId: entity.id,
        createdByUserId,
        tenantId,
        linkedAccountId,
        folio,
      },
    },
  };
}

export async function createNewRowWithEntity(
  entityName: string,
  createdByUserId: string,
  linkedAccountId: string | null = null,
  tenantId: string | null = null
) {
  const newRow = await getCreateNewRow(entityName, createdByUserId, linkedAccountId, tenantId);
  return await db.row.create({
    data: {
      ...newRow.row.create,
    },
  });
}

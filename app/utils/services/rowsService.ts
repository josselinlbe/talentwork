import { db } from "../db.server";
import { getEntityByName } from "../db/entities/entities.db.server";
import { createRow, getMaxRowFolio } from "../db/entities/rows.db.server";

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
  const entity = await getEntityByName(entityName);
  // const newRow = await getCreateNewRow(entityName, createdByUserId, linkedAccountId, tenantId);
  return await createRow({
    entityId: entity?.id ?? "",
    createdByUserId,
    linkedAccountId,
    tenantId,
    properties: {},
    dynamicProperties: [],
    dynamicRows: null,
  });
  // return await db.row.create({
  //   data: {
  //     ...newRow.row.create,
  //     visibility: entity?.defaultVisibility ?? Constants.DEFAULT_ROW_VISIBILITY,
  //   },
  // });
}

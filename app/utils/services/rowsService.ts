import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { db } from "../db.server";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { createRow, getMaxRowFolio, getRow } from "../db/entities/rows.db.server";
import { createManualRowLog, createRowLog } from "../db/logs.db.server";

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
  entity: EntityWithDetails,
  createdByUserId: string,
  linkedAccountId: string | null = null,
  tenantId: string | null = null,
  request?: Request,
  nextFolio?: number
) {
  // const newRow = await getCreateNewRow(entityName, createdByUserId, linkedAccountId, tenantId);
  const row = await createRow(
    {
      entityId: entity?.id ?? "",
      createdByUserId,
      linkedAccountId,
      tenantId,
      properties: {},
      dynamicProperties: [],
      dynamicRows: null,
    },
    undefined,
    nextFolio
  );
  const item = await getRow(entity.id, row.id, tenantId);
  if (row) {
    if (request) {
      await createRowLog(request, {
        tenantId,
        createdByUserId,
        action: DefaultLogActions.Created,
        entity,
        item,
      });
    } else {
      await createManualRowLog({
        tenantId,
        createdByUserId,
        action: DefaultLogActions.Created + " " + entity.title,
        entity,
        item,
      });
    }
  }
  return row;
  // return await db.row.create({
  //   data: {
  //     ...newRow.row.create,
  //     visibility: entity?.defaultVisibility ?? Constants.DEFAULT_ROW_VISIBILITY,
  //   },
  // });
}

import { Row, Tenant, LinkedAccount, Contract, RowValue, ApiKey, RowMedia, Contact, Deal, EntityWorkflowState } from "@prisma/client";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowPermissionsDto } from "~/application/dtos/entities/RowPermissionsDto";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { Visibility } from "~/application/dtos/shared/Visibility";
import { deleteRowMediaFromStorageProvider, storeRowMediaInStorageProvider } from "~/utils/helpers/MediaHelper";
import { getRowPermissionsCondition } from "~/utils/helpers/PermissionsHelper";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import TenantHelper from "~/utils/helpers/TenantHelper";
import { setRowInitialWorkflowState } from "~/utils/services/WorkflowService";
import { db } from "../../db.server";
import { createRowPermission } from "../permissions/rowPermissions.db.server";
import { includeSimpleCreatedByUser, UserSimple } from "../users.db.server";
import { getDefaultEntityVisibility, getEntityById } from "./entities.db.server";
import { RowTagWithDetails } from "./rowTags.db.server";

export type RowValueWithDetails = RowValue & {
  media: RowMedia[];
};
export type RowWithValues = Row & { values: RowValueWithDetails[] };
export type RowWithCreatedBy = Row & {
  createdByUser: UserSimple | null;
  createdByApiKey: ApiKey | null;
  workflowState: EntityWorkflowState | null;
};
export type RowWithDetails = Row & {
  // entity: Entity;
  createdByUser: UserSimple | null;
  createdByApiKey: ApiKey | null;
  tenant: Tenant | null;
  linkedAccount:
    | (LinkedAccount & {
        createdByTenant: Tenant;
        providerTenant: Tenant;
        clientTenant: Tenant;
      })
    | null;
  values: RowValueWithDetails[];
  details: RowWithValues[];
  workflowState: EntityWorkflowState | null;
  tags: RowTagWithDetails[];
  contact: Contact | null;
  deal: Deal | null;
  contract: Contract | null;
};

export const includeRowDetails = {
  ...includeSimpleCreatedByUser,
  createdByApiKey: true,
  tenant: true,
  linkedAccount: {
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
    },
  },
  values: {
    include: {
      relatedRow: {
        include: {
          entity: true,
          values: {
            include: {
              property: true,
            },
          },
        },
      },
      media: true,
    },
  },
  details: {
    include: {
      values: {
        include: {
          relatedRow: true,
          media: true,
        },
      },
    },
  },
  workflowState: true,
  tags: {
    include: {
      tag: true,
    },
  },
  contract: true,
  contact: true,
  deal: {
    include: {
      contact: {
        include: {
          row: {
            include: {
              entity: true,
            },
          },
        },
      },
      row: {
        include: {
          entity: true,
          ...includeSimpleCreatedByUser,
          createdByApiKey: true,
        },
      },
      subscriptionPrice: {
        include: {
          subscriptionProduct: true,
        },
      },
    },
  },
};

export async function getAllRows(entityId: string): Promise<RowWithDetails[]> {
  return await db.row.findMany({
    where: {
      entityId,
      parentRowId: null,
    },
    include: includeRowDetails,
  });
}

// function getSearchCondition(query?: string | null) {
//   let searchInValues:
//     | {
//         OR: {
//           values: {
//             some: {
//               textValue: {
//                 contains: string;
//               };
//             };
//           };
//         }[];
//       }
//     | {} = {};
//   if (query) {
//     searchInValues = {
//       OR: [
//         {
//           values: {
//             some: {
//               textValue: {
//                 contains: query,
//               },
//             },
//           },
//         },
//       ],
//     };
//   }
//   return searchInValues;
// }

export async function getRows(
  entityId: string,
  tenantId: string | null,
  userId?: string,
  take?: number,
  skip?: number,
  orderBy?: any,
  filters?: RowFiltersDto
): Promise<RowWithDetails[]> {
  const whereFilters = RowFiltersHelper.getRowFiltersCondition(filters);
  return await db.row.findMany({
    take,
    skip,
    where: {
      AND: [
        whereFilters,
        {
          entityId,
          ...TenantHelper.tenantCondition(tenantId),
          parentRowId: null,
          // ...getSearchCondition(filters?.query),
        },
        await getRowPermissionsCondition(tenantId, userId),
      ],
    },
    include: includeRowDetails,
    orderBy,
  });
}

export async function getRowsInIds(tenantId: string, ids: string[]): Promise<RowWithDetails[]> {
  return await db.row.findMany({
    where: {
      ...TenantHelper.tenantCondition(tenantId),
      id: {
        in: ids,
      },
      parentRowId: null,
    },
    include: includeRowDetails,
  });
}

export async function countRows(entityId: string, tenantId: string | null, userId: string | undefined, filters?: RowFiltersDto): Promise<number> {
  const whereFilters = RowFiltersHelper.getRowFiltersCondition(filters);
  return await db.row.count({
    where: {
      AND: [
        whereFilters,
        {
          entityId,
          ...TenantHelper.tenantCondition(tenantId),
          parentRowId: null,
          // ...getSearchCondition(filters?.query),
        },
        await getRowPermissionsCondition(tenantId, userId),
      ],
    },
  });
}

async function getRowById(id: string): Promise<RowWithDetails | null> {
  return await db.row.findUnique({
    where: {
      id,
    },
    include: {
      ...includeRowDetails,
    },
  });
}

export async function getRow(entityId: string, id: string, tenantId: string | null): Promise<RowWithDetails | null> {
  return await db.row.findFirst({
    where: {
      id,
      entityId,
      ...TenantHelper.tenantCondition(tenantId),
      parentRowId: null,
    },
    include: {
      ...includeRowDetails,
    },
  });
}

export async function getMaxRowFolio(tenantId: string | null, entityId: string, parentRowId: string | undefined = undefined) {
  let where: any = {};
  if (parentRowId) {
    where = {
      tenantId,
      entityId,
      parentRowId,
    };
  } else {
    where = {
      tenantId,
      entityId,
      parentRowId: null,
    };
  }
  return await db.row.aggregate({
    where,
    _max: {
      folio: true,
    },
  });
}

export async function getNextRowFolio(tenantId: string | null, entityId: string, parentRowId: string | undefined = undefined) {
  const maxFolio = await getMaxRowFolio(tenantId, entityId, parentRowId);
  let next = 1;
  if (maxFolio && maxFolio._max.folio !== null) {
    next = maxFolio._max.folio + 1;
  }
  return next;
}

export async function createRow(
  data: {
    entityId: string;
    tenantId: string | null;
    createdByUserId?: string | null;
    createdByApiKeyId?: string | null;
    linkedAccountId: string | null;
    properties: any;
    dynamicProperties: {
      propertyId: string;
      id?: string | null;
      relatedRowId?: string | null;
      idValue?: string | null;
      textValue?: string | null;
      numberValue?: number | string | null;
      dateValue?: Date | string | null;
      booleanValue?: boolean | null;
      media?: MediaDto[];
    }[];
    dynamicRows: { id?: string | null; values: RowValueDto[] }[] | null;
  },
  parentRowId?: string,
  nextFolio?: number | undefined
) {
  let folio = nextFolio ?? 1;
  if (!nextFolio) {
    const maxFolio = await getMaxRowFolio(data.tenantId, data.entityId, parentRowId);
    if (maxFolio && maxFolio._max.folio !== null) {
      folio = maxFolio._max.folio + 1;
    }
  }
  const defaultVisibility = await getDefaultEntityVisibility(data.entityId);
  const row = await db.row.create({
    data: {
      folio,
      entityId: data.entityId,
      tenantId: data.tenantId,
      createdByUserId: data.createdByUserId ?? null,
      createdByApiKeyId: data.createdByApiKeyId ?? null,
      linkedAccountId: data.linkedAccountId,
      parentRowId: parentRowId ?? null,
      ...data.properties,
      visibility: defaultVisibility,
      values: {
        create: data.dynamicProperties
          // .filter((f) => !f.id)
          .map((value) => {
            return {
              propertyId: value.propertyId,
              relatedRowId: value.relatedRowId,
              idValue: value.idValue,
              textValue: value.textValue,
              numberValue: value.numberValue,
              dateValue: value.dateValue,
              booleanValue: value.booleanValue,
              media: {
                create: value.media?.map((m) => {
                  return {
                    name: m.name,
                    title: m.title,
                    type: m.type,
                    file: m.file,
                  };
                }),
              },
            };
          }),
      },
    },
  });

  if (data.dynamicRows) {
    await addDetailRows(row, data.dynamicRows);
  }

  await setRowInitialWorkflowState(data.entityId, row.id);

  if (row.visibility !== Visibility.Private) {
    await setRowPermissions(row.id, {
      visibility: row.visibility,
      canComment: true,
      canUpdate: false,
      canDelete: false,
    });
  }
  if (row.visibility === Visibility.Tenant) {
    await createRowPermission({
      rowId: row.id,
      tenantId: data.tenantId,
    });
  }

  const createdRow = await getRow(data.entityId, row.id, data.tenantId);
  const entity = await getEntityById(data.entityId);
  if (entity && createdRow) {
    await storeRowMediaInStorageProvider(entity, createdRow);
  }

  return createdRow;
}

async function addDetailRows(row: Row, dynamicRows: { id?: string | null; values: RowValueDto[] }[]) {
  return await Promise.all(
    dynamicRows.map(async (dynamicRow, idx) => {
      const detailRow = await createRow(
        {
          entityId: row.entityId,
          tenantId: row.tenantId,
          createdByUserId: row.createdByUserId,
          linkedAccountId: row.linkedAccountId,
          dynamicProperties: dynamicRow.values,
          dynamicRows: [],
          properties: [],
        },
        row.id,
        idx + 1
      );
      return detailRow;
    })
  );
}

export async function setRowPermissions(rowId: string, data: RowPermissionsDto) {
  return await db.row.update({
    where: {
      id: rowId,
    },
    data,
  });
}

export async function updateRow(
  id: string,
  data: {
    properties: any;
    dynamicProperties: {
      propertyId: string;
      id?: string | null;
      relatedRowId?: string | null;
      idValue?: string | null;
      textValue?: string | null;
      numberValue?: number | string | null;
      dateValue?: Date | string | null;
      booleanValue?: boolean | null;
      media?: MediaDto[];
    }[];
    dynamicRows: { id?: string | null; values: RowValueDto[] }[] | null;
  }
) {
  // const media = await db.rowMedia.findMany({
  //   where: { rowValue: {rowId: id} },
  // });
  // await Promise.all(media.map(async (media) => {
  //   if (media.publicUrl) {
  //     if (media.storageProvider) {
  //       await (media.storageProvider, media.publicUrl);
  //     }
  //   }
  // }));
  let row = await getRowById(id);
  await deleteRowMediaFromStorageProvider(row);
  await db.rowMedia.deleteMany({
    where: {
      rowValue: {
        rowId: id,
      },
    },
  });
  const update = {
    ...data.properties,
    values: {
      create: data.dynamicProperties
        .filter((f) => !f.id)
        .map((value) => {
          return {
            propertyId: value.propertyId,
            relatedRowId: value.relatedRowId,
            idValue: value.idValue,
            textValue: value.textValue,
            numberValue: value.numberValue,
            dateValue: value.dateValue,
            booleanValue: value.booleanValue,
            media: {
              create: value.media?.map((m) => {
                return {
                  name: m.name,
                  title: m.title,
                  type: m.type,
                  file: m.file,
                };
              }),
            },
          };
        }),
      update: data.dynamicProperties
        .filter((f) => f.id)
        .map((value) => {
          return {
            where: { id: value.id },
            data: {
              relatedRowId: value.relatedRowId,
              idValue: value.idValue,
              textValue: value.textValue,
              numberValue: value.numberValue,
              dateValue: value.dateValue,
              booleanValue: value.booleanValue,
              media: {
                create: value.media?.map((m) => {
                  return {
                    name: m.name,
                    title: m.title,
                    type: m.type,
                    file: m.file,
                  };
                }),
              },
            },
          };
        }),
    },
  };
  const updatedRow = await db.row.update({
    where: {
      id,
    },
    data: update,
  });

  if (data.dynamicRows !== null) {
    await db.row.deleteMany({
      where: {
        parentRowId: id,
      },
    });
    await addDetailRows(updatedRow, data.dynamicRows);
  }

  row = await getRowById(id);
  if (row) {
    const entity = await getEntityById(row.entityId);
    if (entity && row) {
      await storeRowMediaInStorageProvider(entity, row);
    }
  }

  return updatedRow;
}

export async function deleteRow(id: string) {
  const row = await getRowById(id);
  await deleteRowMediaFromStorageProvider(row);
  return await db.row.delete({
    where: { id },
    include: {
      contract: true,
      logs: true,
      values: true,
    },
  });
}

export async function updateRowMedia(
  id: string,
  data: {
    file?: string;
    publicUrl?: string | null;
    storageBucket?: string | null;
    storageProvider?: string | null;
  }
) {
  await db.rowMedia.update({
    where: { id },
    data,
  });
}

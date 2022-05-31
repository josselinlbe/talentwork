import { Row, User, Tenant, LinkedAccount, Contract, RowValue, ApiKey, Media } from "@prisma/client";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import TenantHelper from "~/utils/helpers/TenantHelper";
import { db } from "../../db.server";

export type RowValueWithDetails = RowValue & {
  media: Media[];
};
export type RowWithValues = Row & { values: RowValueWithDetails[] };
export type RowWithDetails = Row & {
  // entity: Entity;
  createdByUser: User | null;
  createdByApiKey: ApiKey | null;
  tenant: Tenant;
  linkedAccount:
    | (LinkedAccount & {
        createdByTenant: Tenant;
        providerTenant: Tenant;
        clientTenant: Tenant;
      })
    | null;
  values: RowValueWithDetails[];
  details: RowWithValues[];
  contract: Contract | null;
};

export const includeRowDetails = {
  createdByUser: true,
  createdByApiKey: true,
  tenant: true,
  linkedAccount: {
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
    },
  },
  contract: true,
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

function getSearchCondition(query?: string) {
  let searchInValues: any = {};
  if (query) {
    searchInValues = {
      OR: [
        {
          values: {
            some: {
              textValue: {
                contains: query,
              },
            },
          },
        },
      ],
    };
  }
  return searchInValues;
}
export async function getRows(entityId: string, tenantId: string, take?: number, skip?: number, orderBy?: any, query?: string): Promise<RowWithDetails[]> {
  // eslint-disable-next-line no-console
  // console.log({ take, skip, orderBy });

  return await db.row.findMany({
    take,
    skip,
    where: {
      entityId,
      ...TenantHelper.tenantCondition(tenantId),
      parentRowId: null,
      ...getSearchCondition(query),
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

export async function countRows(entityId: string, tenantId: string, query?: string): Promise<number> {
  return await db.row.count({
    where: {
      entityId,
      ...TenantHelper.tenantCondition(tenantId),
      parentRowId: null,
      ...getSearchCondition(query),
    },
  });
}

export async function getRow(entityId: string, id: string, tenantId: string): Promise<RowWithDetails | null> {
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

export async function getMaxRowFolio(tenantId: string, entityId: string, parentRowId: string | undefined) {
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

export async function createRow(
  data: {
    entityId: string;
    tenantId: string;
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
    dynamicRows: { id?: string | null; values: RowValueDto[] }[];
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

  await addDetailRows(row, data.dynamicRows);

  return row;
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
  await db.media.deleteMany({
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
  const row = await db.row.update({
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
    await addDetailRows(row, data.dynamicRows);
  }

  return row;
}

export async function deleteRow(id: string) {
  return await db.row.delete({
    where: { id },
    include: {
      contract: true,
      logs: true,
      values: true,
    },
  });
}

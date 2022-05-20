import { Row, User, Tenant, LinkedAccount, Contract, Employee, RowValue, ApiKey, Media } from "@prisma/client";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
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
  contract: Contract | null;
  employee: Employee | null;
  values: RowValueWithDetails[];
  details: RowWithValues[];
};

export const includeRowDetails = {
  // entity: true,
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
  employee: true,
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

export async function getRows(entityId: string, tenantId: string, take?: number, skip?: number, orderBy?: any): Promise<RowWithDetails[]> {
  // eslint-disable-next-line no-console
  console.log({ take, skip, orderBy });
  return await db.row.findMany({
    take,
    skip,
    where: {
      entityId,
      tenantId,
      parentRowId: null,
    },
    include: includeRowDetails,
    orderBy,
  });
}

export async function countRows(entityId: string, tenantId: string): Promise<number> {
  return await db.row.count({
    where: {
      entityId,
      tenantId,
      parentRowId: null,
    },
  });
}

export async function getRow(entityId: string, id: string, tenantId: string): Promise<RowWithDetails | null> {
  return await db.row.findFirst({
    where: {
      id,
      entityId,
      tenantId,
      parentRowId: null,
    },
    include: {
      ...includeRowDetails,
    },
  });
}

export async function getMaxRowFolio(entityId: string, parentRowId: string | undefined) {
  let where: any = {
    entityId,
  };
  if (parentRowId) {
    where = {
      entityId,
      parentRowId,
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
      media?: MediaDto[];
    }[];
    dynamicRows: { id?: string | null; values: RowValueDto[] }[];
  },
  parentRowId?: string,
  nextFolio?: number | undefined
) {
  let folio = nextFolio ?? 1;
  if (!nextFolio) {
    const maxFolio = await getMaxRowFolio(data.entityId, parentRowId);
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
          .filter((f) => !f.id)
          .map((value) => {
            return {
              propertyId: value.propertyId,
              relatedRowId: value.relatedRowId,
              idValue: value.idValue,
              textValue: value.textValue,
              numberValue: value.numberValue,
              dateValue: value.dateValue,
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

  await Promise.all(
    data.dynamicRows.map(async (dynamicRow, idx) => {
      return await createRow(
        {
          entityId: data.entityId,
          tenantId: data.tenantId,
          createdByUserId: data.createdByUserId,
          linkedAccountId: data.linkedAccountId,
          dynamicProperties: dynamicRow.values,
          dynamicRows: [],
          properties: [],
        },
        row.id,
        idx + 1
      );
    })
  );

  return row;
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
      media?: MediaDto[];
    }[];
  }
) {
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
  return await db.row.update({
    where: {
      id,
    },
    data: update,
  });
}

export async function deleteRow(id: string) {
  return await db.row.delete({
    where: { id },
    include: {
      contract: true,
      employee: true,
      logs: true,
      values: true,
    },
  });
}

import { Row, User, Tenant, LinkedAccount, Contract, Employee, RowValue, ApiKey, Media } from "@prisma/client";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
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
      relatedRow: true,
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
    },
    include: includeRowDetails,
  });
}

export async function getRows(entityId: string, tenantId: string): Promise<RowWithDetails[]> {
  return await db.row.findMany({
    where: {
      entityId,
      tenantId,
    },
    include: includeRowDetails,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRow(entityId: string, id: string, tenantId: string): Promise<RowWithDetails | null> {
  return await db.row.findFirst({
    where: {
      id,
      entityId,
      tenantId,
    },
    include: {
      ...includeRowDetails,
    },
  });
}

export async function getMaxRowFolio(entityId: string) {
  return await db.row.aggregate({
    where: {
      entityId,
    },
    _max: {
      folio: true,
    },
  });
}

export async function createRow(data: {
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
}) {
  let folio = 1;
  const maxFolio = await getMaxRowFolio(data.entityId);
  if (maxFolio && maxFolio._max.folio !== null) {
    folio = maxFolio._max.folio + 1;
  }
  return await db.row.create({
    data: {
      folio,
      entityId: data.entityId,
      tenantId: data.tenantId,
      createdByUserId: data.createdByUserId ?? null,
      createdByApiKeyId: data.createdByApiKeyId ?? null,
      linkedAccountId: data.linkedAccountId,
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

import { EntityRow, User, Tenant, LinkedAccount, Contract, Employee, EntityRowValue, ApiKey, Media } from "@prisma/client";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { db } from "../db.server";

export type EntityRowWithDetails = EntityRow & {
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
  values: (EntityRowValue & { media: Media[] })[];
};

export const includeEntityRowDetails = {
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
};

export async function getAllEntityRows(entityId: string): Promise<EntityRowWithDetails[]> {
  return await db.entityRow.findMany({
    where: {
      entityId,
    },
    include: includeEntityRowDetails,
  });
}

export async function getEntityRows(entityId: string, tenantId: string): Promise<EntityRowWithDetails[]> {
  return await db.entityRow.findMany({
    where: {
      entityId,
      tenantId,
    },
    include: includeEntityRowDetails,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getEntityRow(entityId: string, id: string, tenantId: string): Promise<EntityRowWithDetails | null> {
  return await db.entityRow.findFirst({
    where: {
      id,
      entityId,
      tenantId,
    },
    include: {
      ...includeEntityRowDetails,
    },
  });
}

export async function getMaxEntityRowFolio(entityId: string) {
  return await db.entityRow.aggregate({
    where: {
      entityId,
    },
    _max: {
      folio: true,
    },
  });
}

export async function createEntityRow(data: {
  entityId: string;
  tenantId: string;
  createdByUserId?: string | null;
  createdByApiKeyId?: string | null;
  linkedAccountId: string | null;
  properties: any;
  dynamicProperties: {
    entityPropertyId: string;
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
  const maxFolio = await getMaxEntityRowFolio(data.entityId);
  if (maxFolio && maxFolio._max.folio !== null) {
    folio = maxFolio._max.folio + 1;
  }
  return await db.entityRow.create({
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
              entityPropertyId: value.entityPropertyId,
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

export async function updateEntityRow(
  id: string,
  data: {
    properties: any;
    dynamicProperties: {
      entityPropertyId: string;
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
            entityPropertyId: value.entityPropertyId,
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
  return await db.entityRow.update({
    where: {
      id,
    },
    data: update,
  });
}

export async function deleteEntityRow(id: string) {
  return await db.entityRow.delete({
    where: { id },
    include: {
      contract: true,
      employee: true,
      logs: true,
      values: true,
    },
  });
}

import { ApiKey, ApiKeyEntity, ApiKeyLog, Entity, Tenant, User } from "@prisma/client";
import { db } from "../db.server";
import { getClientIPAddress } from "remix-utils";

export type ApiKeyWithDetails = ApiKey & {
  tenant: Tenant;
  entities: (ApiKeyEntity & { entity: Entity })[];
  createdByUser: User;
  _count: { apiKeyLogs: number };
};

export type ApiKeyLogWithDetails = ApiKeyLog & {
  apiKey: (ApiKey & { tenant: Tenant }) | null;
};

const include = {
  tenant: true,
  entities: {
    include: {
      entity: true,
    },
  },
  createdByUser: true,
  _count: {
    select: {
      apiKeyLogs: true,
    },
  },
};

export async function getAllApiKeys(): Promise<ApiKeyWithDetails[]> {
  return await db.apiKey.findMany({
    include,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllApiKeyLogs(): Promise<ApiKeyLogWithDetails[]> {
  return await db.apiKeyLog.findMany({
    include: {
      apiKey: {
        include: { tenant: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getTenantApiKeyLogs(tenantId: string): Promise<ApiKeyLogWithDetails[]> {
  return await db.apiKeyLog.findMany({
    where: {
      apiKey: {
        tenantId,
      },
    },
    include: {
      apiKey: {
        include: { tenant: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getApiKeys(tenantId: string): Promise<ApiKeyWithDetails[]> {
  return await db.apiKey.findMany({
    where: {
      tenantId,
    },
    include,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getApiKeyById(id: string): Promise<ApiKeyWithDetails | null> {
  return await db.apiKey.findUnique({
    where: { id },
    include,
  });
}

export async function getApiKeyByKey(key: string): Promise<ApiKeyWithDetails | null> {
  return await db.apiKey.findFirst({
    where: { key },
    include,
  });
}

export async function getApiKeyLogs(id: string): Promise<ApiKeyLogWithDetails[]> {
  return await db.apiKeyLog.findMany({
    where: {
      apiKeyId: id,
    },
    include: {
      apiKey: {
        include: {
          tenant: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createApiKey(
  data: {
    tenantId: string;
    createdByUserId: string;
    alias: string;
    max: number;
    expires: Date;
    active: boolean;
  },
  entities: {
    entityId: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }[]
) {
  const apiKey = await db.apiKey.create({
    data: {
      ...data,
      active: true,
    },
  });
  await Promise.all(
    entities.map(async (entity) => {
      return await db.apiKeyEntity.create({
        data: {
          apiKeyId: apiKey.id,
          entityId: entity.entityId,
          create: entity.create,
          read: entity.read,
          update: entity.update,
          delete: entity.delete,
        },
      });
    })
  );
  return apiKey;
}

export async function createApiKeyLog(
  request: Request,
  params: any,
  data: {
    apiKeyId: string | null;
    endpoint: string;
    error?: string;
    status?: number;
  }
) {
  return await db.apiKeyLog.create({
    data: {
      ip: getClientIPAddress(request.headers)?.toString() ?? "",
      method: request.method,
      params: JSON.stringify(params),
      ...data,
    },
  });
}

export async function setApiKeyLogStatus(
  id: string,
  data: {
    status: number;
    error?: string;
  }
) {
  return await db.apiKeyLog.update({
    where: { id },
    data,
  });
}

export async function updateApiKey(
  id: string,
  data: {
    alias: string;
    expires: Date;
    active: boolean;
    max?: number;
  },
  entities: {
    entityId: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }[]
) {
  await db.apiKey.update({
    where: { id },
    data,
  });
  await db.apiKeyEntity.deleteMany({
    where: {
      apiKeyId: id,
    },
  });
  await Promise.all(
    entities.map(async (entity) => {
      return await db.apiKeyEntity.create({
        data: {
          apiKeyId: id,
          ...entity,
        },
      });
    })
  );
}

export async function deleteApiKey(id: string) {
  return await db.apiKey.delete({
    where: { id },
  });
}

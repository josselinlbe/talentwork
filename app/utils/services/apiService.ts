import { Params } from "react-router";
import { json } from "remix";
import { createApiKeyLog, getApiKeyByKey, setApiKeyLogStatus } from "../db/apiKeys.db.server";
import { getEntityBySlug } from "../db/entities.db.server";

async function setApiError(request: Request, params: Params, error: string, status: number, apiKeyLogId?: string) {
  if (apiKeyLogId) {
    await setApiKeyLogStatus(apiKeyLogId, {
      error,
      status,
    });
  } else {
    await createApiKeyLog(request, params, {
      apiKeyId: null,
      error,
      status,
    });
  }
  return json({ error }, { status });
}

export async function getApiKeyFromRequest(request: Request, params: Params) {
  const apiKeyFromHeaders = request.headers.get("X-Api-Key") ?? "";
  const apiKey = await getApiKeyByKey(apiKeyFromHeaders);
  if (!apiKey) {
    throw await setApiError(request, params, "Invalid API Key: " + apiKeyFromHeaders, 401);
  }
  const apiKeyLog = await createApiKeyLog(request, params, {
    apiKeyId: apiKey.id,
  });
  if (!apiKey.active) {
    throw await setApiError(request, params, "Inactive API Key", 400, apiKeyLog.id);
  }
  if (apiKey.expires && apiKey?.expires < new Date()) {
    throw await setApiError(request, params, "Expired API Key", 400, apiKeyLog.id);
  }
  if (apiKey._count.apiKeyLogs >= apiKey.max) {
    throw await setApiError(request, params, "API Key limit quota reached: " + apiKey.max, 429, apiKeyLog.id);
  }
  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    throw await setApiError(request, params, "Invalid entity", 400, apiKeyLog.id);
  }
  const permission = apiKey.entities.find((f) => f.entityId === entity.id);
  if (!permission) {
    throw await setApiError(request, params, `API Key does not have access to ${entity.slug}`, 403, apiKeyLog.id);
  }
  if (request.method === "GET" && !permission.read) {
    throw new Error(`API Key does not have permission to read ${permission.entity.slug}`);
  } else if (request.method === "POST" && !permission.create) {
    throw new Error(`API Key does not have permission to create ${permission.entity.slug}`);
  } else if (request.method === "PUT" && !permission.update) {
    throw new Error(`API Key does not have permission to update ${permission.entity.slug}`);
  } else if (request.method === "DELETE" && !permission.delete) {
    throw new Error(`API Key does not have permission to delete ${permission.entity.slug}`);
  }
  // eslint-disable-next-line no-console
  console.log({
    method: request.method,
    params,
    entity: entity.slug,
    tenant: apiKey.tenant.name,
    apiKeyRemainingQuota: apiKey.max - apiKey._count.apiKeyLogs,
  });
  return {
    entity,
    tenant: apiKey.tenant,
    apiKeyLog,
  };
}

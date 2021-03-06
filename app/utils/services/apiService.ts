import { Params } from "react-router";
import { json } from "@remix-run/node";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { createApiKeyLog, getApiKey, setApiKeyLogStatus } from "../db/apiKeys.db.server";
import { getEntityBySlug } from "../db/entities/entities.db.server";
import { getPlanFeatureUsage } from "./subscriptionService";

async function setApiError(request: Request, params: Params, error: string, status: number, apiKeyLogId?: string) {
  if (apiKeyLogId) {
    await setApiKeyLogStatus(apiKeyLogId, {
      error,
      status,
    });
  } else {
    await createApiKeyLog(request, params, {
      apiKeyId: null,
      endpoint: new URL(request.url).pathname,
      error,
      status,
    });
  }
  return json({ error }, { status });
}

export async function validateApiKey(request: Request, params: Params) {
  const apiKeyFromHeaders = request.headers.get("X-Api-Key") ?? "";
  const apiKey = await getApiKey(apiKeyFromHeaders);
  if (!apiKey) {
    throw await setApiError(request, params, "Invalid API Key", 401);
  }
  const apiKeyLog = await createApiKeyLog(request, params, {
    endpoint: new URL(request.url).pathname,
    apiKeyId: apiKey.id,
  });
  if (!apiKey.active) {
    throw await setApiError(request, params, "Inactive API Key", 400, apiKeyLog.id);
  }
  if (apiKey.expires && apiKey?.expires < new Date()) {
    throw await setApiError(request, params, "Expired API Key", 400, apiKeyLog.id);
  }
  const usage = await getPlanFeatureUsage(apiKey.tenantId, DefaultFeatures.API);
  if (usage && !usage.enabled) {
    throw await setApiError(request, params, usage.message, 429, apiKeyLog.id);
  }
  // eslint-disable-next-line no-console
  console.log({
    method: request.method,
    pathname: new URL(request.url).pathname,
    params,
    tenant: apiKey.tenant.name,
    apiKeyRemainingQuota: usage?.remaining,
  });
  return {
    apiKey,
    apiKeyLog,
    tenant: apiKey.tenant,
    usage,
  };
}

export async function getEntityApiKeyFromRequest(request: Request, params: Params) {
  const { apiKey, apiKeyLog, usage } = await validateApiKey(request, params);
  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    throw await setApiError(request, params, "Invalid entity", 400, apiKeyLog.id);
  }
  if (!entity.hasApi) {
    throw await setApiError(request, params, `${entity.name} does not have the API enabled`, 400, apiKeyLog.id);
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
  return {
    entity,
    tenant: apiKey.tenant,
    apiKeyLog,
    usage,
  };
}

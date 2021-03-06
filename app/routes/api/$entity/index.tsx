import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import Constants from "~/application/Constants";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { i18nHelper } from "~/locale/i18n.utils";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { createRow } from "~/utils/db/entities/rows.db.server";
import { createRowLog } from "~/utils/db/logs.db.server";
import ApiHelper from "~/utils/helpers/ApiHelper";
import { getEntityFiltersFromCurrentUrl, getPaginationFromCurrentUrl, getRowsWithPagination } from "~/utils/helpers/RowPaginationHelper";
import { getEntityApiKeyFromRequest } from "~/utils/services/apiService";

// GET
export const loader: LoaderFunction = async ({ request, params }) => {
  const { entity, tenant, apiKeyLog, usage } = await getEntityApiKeyFromRequest(request, params);
  try {
    const currentPagination = getPaginationFromCurrentUrl(request);
    const filters = getEntityFiltersFromCurrentUrl(true, entity, request);
    const { items, pagination } = await getRowsWithPagination(
      entity.id,
      tenant.id,
      undefined,
      Constants.DEFAULT_PAGE_SIZE,
      currentPagination.page,
      currentPagination.sortedBy,
      filters
    );
    await setApiKeyLogStatus(apiKeyLog.id, {
      status: 200,
    });
    return json({
      usage: {
        plan: usage?.title,
        remaining: usage?.remaining,
      },
      page: pagination.page,
      total_pages: pagination.totalPages,
      total_results: pagination.totalItems,
      results: items.length,
      data: items.map((item) => {
        return ApiHelper.getApiFormat(entity, item);
      }),
    });
  } catch (e: any) {
    await setApiKeyLogStatus(apiKeyLog.id, {
      error: JSON.stringify(e),
      status: 400,
    });
    return json({ error: JSON.stringify(e) }, { status: 400 });
  }
};

// POST
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const { entity, tenant, apiKeyLog } = await getEntityApiKeyFromRequest(request, params);
  try {
    const jsonBody = await request.json();
    const rowValues = ApiHelper.getRowPropertiesFromJson(t, entity, jsonBody);
    const item = await createRow({
      entityId: entity.id,
      tenantId: tenant.id,
      createdByApiKeyId: apiKeyLog.apiKeyId,
      linkedAccountId: rowValues.linkedAccountId,
      dynamicProperties: rowValues.dynamicProperties,
      properties: rowValues.properties,
      dynamicRows: rowValues.dynamicRows,
    });
    await setApiKeyLogStatus(apiKeyLog.id, { status: 201 });
    await createRowLog(request, {
      tenantId: tenant.id,
      createdByApiKey: apiKeyLog.apiKeyId,
      action: DefaultLogActions.Created,
      entity,
      item,
    });
    return json(ApiHelper.getApiFormat(entity, item), {
      status: 201,
    });
  } catch (e: any) {
    await setApiKeyLogStatus(apiKeyLog.id, {
      error: e.message,
      status: 400,
    });
    return json({ error: e.message }, { status: 400 });
  }
};

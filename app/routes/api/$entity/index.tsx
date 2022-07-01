import { ActionFunction, json, LoaderFunction } from "remix";
import Constants from "~/application/Constants";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { createRow, getRow } from "~/utils/db/entities/rows.db.server";
import { createRowLog } from "~/utils/db/logs.db.server";
import ApiHelper from "~/utils/helpers/ApiHelper";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl, getRowsWithPagination } from "~/utils/helpers/RowPaginationHelper";
import { getEntityApiKeyFromRequest } from "~/utils/services/apiService";

// GET
export const loader: LoaderFunction = async ({ request, params }) => {
  const { entity, tenant, apiKeyLog } = await getEntityApiKeyFromRequest(request, params);
  try {
    const currentPagination = getPaginationFromCurrentUrl(request);
    const filters = getFiltersFromCurrentUrl(true, entity, request);
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
      pagination: {
        count: items.length,
        ...pagination,
      },
      items: items.map((item) => {
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
  const { entity, tenant, apiKeyLog } = await getEntityApiKeyFromRequest(request, params);
  try {
    const jsonBody = await request.json();
    const rowValues = ApiHelper.getRowPropertiesFromJson(entity, jsonBody);
    const created = await createRow({
      entityId: entity.id,
      tenantId: tenant.id,
      createdByApiKeyId: apiKeyLog.apiKeyId,
      linkedAccountId: rowValues.linkedAccountId,
      dynamicProperties: rowValues.dynamicProperties,
      properties: rowValues.properties,
      dynamicRows: rowValues.dynamicRows,
    });
    await setApiKeyLogStatus(apiKeyLog.id, { status: 201 });
    const item = await getRow(entity.id, created.id, tenant.id);
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

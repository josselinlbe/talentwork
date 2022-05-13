import { ActionFunction, json, LoaderFunction } from "remix";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { createEntityRow, getEntityRow, getEntityRows } from "~/utils/db/entityRows.db.server";
import { createEntityRowLog } from "~/utils/db/logs.db.server";
import EntityRowHelper from "~/utils/helpers/EntityRowHelper";
import { getEntityApiKeyFromRequest } from "~/utils/services/apiService";

// GET
export const loader: LoaderFunction = async ({ request, params }) => {
  const { entity, tenant, apiKeyLog } = await getEntityApiKeyFromRequest(request, params);
  try {
    const items = await getEntityRows(entity.id, tenant.id);
    await setApiKeyLogStatus(apiKeyLog.id, {
      status: 200,
    });
    return json(
      items.map((item) => {
        return EntityRowHelper.getApiFormat(entity, item);
      })
    );
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
    const form = await request.formData();
    const rowValues = EntityRowHelper.getRowPropertiesFromForm(entity, form);
    const created = await createEntityRow({
      entityId: entity.id,
      tenantId: tenant.id,
      createdByApiKeyId: apiKeyLog.apiKeyId,
      linkedAccountId: rowValues.linkedAccountId,
      dynamicProperties: rowValues.dynamicProperties,
      properties: rowValues.properties,
    });
    await setApiKeyLogStatus(apiKeyLog.id, { status: 201 });
    const item = await getEntityRow(entity.id, created.id, tenant.id);
    await createEntityRowLog(request, {
      tenantId: tenant.id,
      createdByApiKey: apiKeyLog.apiKeyId,
      action: "Created",
      entity,
      item,
    });
    return json(EntityRowHelper.getApiFormat(entity, item), {
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

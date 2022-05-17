import { ActionFunction, json, LoaderFunction } from "remix";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { deleteRow, getRow, updateRow } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { getEntityApiKeyFromRequest } from "~/utils/services/apiService";

// GET
export const loader: LoaderFunction = async ({ request, params }) => {
  const { entity, tenant, apiKeyLog } = await getEntityApiKeyFromRequest(request, params);
  try {
    const item = await getRow(entity.id, params.id ?? "", tenant.id);
    if (!item) {
      await setApiKeyLogStatus(apiKeyLog.id, { status: 404 });
      return json(null, { status: 404 });
    }
    await setApiKeyLogStatus(apiKeyLog.id, { status: 200 });
    return json(RowHelper.getApiFormat(entity, item));
  } catch (e: any) {
    await setApiKeyLogStatus(apiKeyLog.id, {
      status: 400,
      error: JSON.stringify(e),
    });
    return json({ error: JSON.stringify(e) }, { status: 400 });
  }
};

// PUT or DELETE
export const action: ActionFunction = async ({ request, params }) => {
  const { entity, tenant, apiKeyLog } = await getEntityApiKeyFromRequest(request, params);
  try {
    let item = await getRow(entity.id, params.id ?? "", tenant.id);
    if (!item) {
      await setApiKeyLogStatus(apiKeyLog.id, { status: 404 });
      return json(null, { status: 404 });
    }
    if (request.method === "PUT") {
      const form = await request.formData();
      const rowValues = RowHelper.getRowPropertiesFromForm(entity, form, item);
      await updateRow(params.id ?? "", {
        dynamicProperties: rowValues.dynamicProperties,
        properties: rowValues.properties,
      });
      item = await getRow(entity.id, params.id ?? "", tenant.id);
      await setApiKeyLogStatus(apiKeyLog.id, { status: 200 });
      return json(RowHelper.getApiFormat(entity, item), {
        status: 200,
      });
    } else if (request.method === "DELETE") {
      await deleteRow(item.id);
      await setApiKeyLogStatus(apiKeyLog.id, { status: 204 });
      return json(RowHelper.getApiFormat(entity, item), {
        status: 204,
      });
    }
  } catch (e: any) {
    await setApiKeyLogStatus(apiKeyLog.id, {
      error: e.message,
      status: 400,
    });
    return json({ error: e.message }, { status: 400 });
  }
};

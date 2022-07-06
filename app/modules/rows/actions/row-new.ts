import { json, redirect } from "@remix-run/node";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { createRow, getRow } from "~/utils/db/entities/rows.db.server";
import { createRowLog } from "~/utils/db/logs.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { getUserInfo } from "~/utils/session.server";
import { Params } from "react-router";
import { i18nHelper } from "~/locale/i18n.utils";

export type ActionDataRowNew = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionDataRowNew) => json(data, { status: 400 });
export const actionRowNew = async (request: Request, params: Params, tenantId: string | null, entitySlug: string, entityRowsRoute: string) => {
  const { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  const entity = await getEntityBySlug(entitySlug);
  if (!entity) {
    throw redirect("/404");
  }

  const form = await request.formData();

  try {
    const rowValues = RowHelper.getRowPropertiesFromForm(t, entity, form);
    const created = await createRow({
      entityId: entity.id,
      tenantId,
      createdByUserId: userInfo.userId,
      linkedAccountId: rowValues.linkedAccountId,
      dynamicProperties: rowValues.dynamicProperties,
      dynamicRows: rowValues.dynamicRows,
      properties: rowValues.properties,
    });
    const item = await getRow(entity.id, created.id, tenantId);
    await createRowLog(request, { tenantId: tenantId, createdByUserId: userInfo.userId, action: DefaultLogActions.Created, entity, item });
    return redirect(`${entityRowsRoute}/${created.id}`);
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

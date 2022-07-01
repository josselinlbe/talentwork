import { json, redirect } from "remix";
import { Colors } from "~/application/enums/shared/Colors";
import { i18nHelper } from "~/locale/i18n.utils";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { createEntityTag, deleteEntityTag, getEntityTag, updateEntityTag } from "~/utils/db/entities/entityTags.db.server";
import { getRow } from "~/utils/db/entities/rows.db.server";
import { createRowTag, deleteRowTags, getRowTag } from "~/utils/db/entities/rowTags.db.server";
import { Params } from "react-router";
import UrlUtils from "~/utils/app/UrlUtils";

export type ActionDataRowTags = {
  error?: string;
};
const badRequest = (data: ActionDataRowTags) => json(data, { status: 400 });
export const actionRowTags = async (request: Request, params: Params, tenantId: string | null, entitySlug: string, rowId?: string) => {
  let { t } = await i18nHelper(request);

  const entity = await getEntityBySlug(entitySlug);
  if (!entity) {
    return redirect("/404");
  }
  const item = await getRow(entity.id, rowId ?? params.id ?? "", tenantId);
  if (!item) {
    return redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
  }

  const form = await request.formData();
  const action = form.get("action");
  if (action === "new-tag") {
    const value = form.get("tag-name")?.toString() ?? "";
    const color = Number(form.get("tag-color") ?? Colors.INDIGO);
    let tag = await getEntityTag(entity.id, value);
    if (!tag) {
      tag = await createEntityTag({
        entityId: entity.id,
        value,
        color,
      });
    }
    const existingTag = await getRowTag(item.id, value);
    if (tag && !existingTag) {
      await createRowTag({
        rowId: item.id,
        tagId: tag.id,
      });
    }
    return json({});
  } else if (action === "edit-tag") {
    const id = form.get("tag-id")?.toString() ?? "";
    const value = form.get("tag-name")?.toString() ?? "";
    const color = Number(form.get("tag-color"));
    await updateEntityTag(id, {
      value,
      color,
    });
    return json({});
  } else if (action === "set-tag") {
    const id = form.get("tag-id")?.toString() ?? "";
    const tagAction = form.get("tag-action")?.toString() ?? "";
    if (tagAction === "add") {
      await createRowTag({
        rowId: item.id,
        tagId: id,
      });
    } else {
      await deleteRowTags(item.id, id);
    }
    return json({});
  } else if (action === "delete-tag") {
    const id = form.get("tag-id")?.toString() ?? "";
    const tag = await getEntityTag(item.id, id);
    if (tag) {
      await deleteEntityTag(tag.id);
    }
    return json({});
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

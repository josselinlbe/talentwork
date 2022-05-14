import { EntityPropertyOption } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData } from "remix";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import EntityPropertyForm from "~/components/entities/EntityPropertyForm";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { EntityPropertyWithDetails, EntityWithDetails, getEntityById, getEntityBySlug } from "~/utils/db/entities.db.server";
import { deleteEntityProperty, getEntityProperty, updateEntityProperty, updateEntityPropertyOptions } from "~/utils/db/entityProperties.db.server";
import { validateEntityProperty } from "~/utils/helpers/EntityPropertyHelper";

type LoaderData = {
  entityId: string;
  item: EntityPropertyWithDetails;
  parentEntity: EntityWithDetails | undefined;
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const item = await getEntityProperty(params.id ?? "");
  if (!item) {
    return redirect(`/admin/entities/${params.slug}/properties`);
  }
  let parentEntity: EntityWithDetails | undefined = undefined;
  if (item.parentId) {
    const property = await getEntityProperty(item.parentId);
    if (property) {
      parentEntity = (await getEntityById(property?.entityId)) ?? undefined;
    }
  }
  const data: LoaderData = {
    entityId: entity.id,
    item,
    parentEntity,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }

  const existing = await getEntityProperty(params.id ?? "");

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const name = form.get("name")?.toString() ?? "";
  const title = form.get("title")?.toString() ?? "";
  const type = Number(form.get("type")) as EntityPropertyType;
  const isDynamic = Boolean(form.get("is-dynamic"));
  const order = Number(form.get("order"));
  const isDefault = Boolean(form.get("is-default"));
  const isRequired = Boolean(form.get("is-required"));
  const isHidden = Boolean(form.get("is-hidden"));
  const isDetail = Boolean(form.get("is-detail"));
  const pattern = form.get("pattern")?.toString() ?? "";
  const entityId = form.get("entity-id")?.toString() ?? "";

  let parentId: string | null = null;
  if (entityId) {
    const parentEntity = await getEntityById(entityId);
    const idProperty = parentEntity?.properties.find((f) => f.name === "id");
    if (idProperty) {
      parentId = idProperty.id;
    }
  }

  const options: { order: number; value: string }[] = form.getAll("options[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  if (type === EntityPropertyType.ENTITY && !parentId) {
    return badRequest({ error: "Related entity must be set on Entity-type properties" });
  }

  const errors = await validateEntityProperty(name, title, entity.properties, existing);
  if (errors.length > 0) {
    return badRequest({ error: errors.join(", ") });
  }

  if (action === "edit") {
    try {
      await updateEntityProperty(params.id ?? "", {
        name,
        title,
        type,
        isDynamic,
        order,
        isDefault,
        isRequired,
        isHidden,
        isDetail,
        pattern,
        parentId,
      });
      await updateEntityPropertyOptions(params.id ?? "", options);
      return redirect(`/admin/entities/${params.slug}/properties`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    const existingProperty = await getEntityProperty(id);
    if (!existingProperty) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteEntityProperty(id);
    return redirect(`/admin/entities/${params.slug}/properties`);
  }
  return badRequest(t("shared.invalidForm"));
};

export default function EditEntityIndexRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  return <EntityPropertyForm item={data.item} properties={[]} entities={adminData.entities} parentEntity={data.parentEntity} />;
}

import { EntityPropertyOption } from "@prisma/client";
import { useEffect, useState } from "react";
import { ActionFunction, json, LoaderFunction, redirect, useActionData, useLoaderData, useNavigate } from "remix";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import EntityPropertiesList from "~/components/entities/EntityPropertiesList";
import EntityPropertyForm from "~/components/entities/EntityPropertyForm";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { EntityPropertyWithDetails, getEntityById, getEntityBySlug } from "~/utils/db/entities.db.server";
import {
  createEntityProperty,
  deleteEntityProperty,
  getEntityProperty,
  updateEntityProperty,
  updateEntityPropertyOptions,
} from "~/utils/db/entityProperties.db.server";
import { validateEntityProperty } from "~/utils/helpers/EntityPropertyHelper";

type LoaderData = {
  properties: EntityPropertyWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  const data: LoaderData = {
    properties: entity?.properties ?? [],
  };
  return success(data);
};

type ActionData = {
  error?: string;
  properties?: EntityPropertyWithDetails[];
};
const success = (data: ActionData) => json(data, { status: 200 });
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }

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

  const errors = await validateEntityProperty(name, title, entity.properties);
  if (errors.length > 0) {
    return badRequest({ error: errors.join(", ") });
  }

  if (action === "create") {
    try {
      const property = await createEntityProperty({
        entityId: entity.id,
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
      await updateEntityPropertyOptions(property.id, options);
      return redirect(`/admin/entities/${params.slug}/properties`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest(t("shared.invalidForm"));
};

export default function EditEntityIndexRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  return <EntityPropertyForm properties={data.properties} entities={adminData.entities} />;
}

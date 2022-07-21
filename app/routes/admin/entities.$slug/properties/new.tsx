import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import PropertyForm from "~/components/entities/properties/PropertyForm";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { PropertyWithDetails, getEntityById, getEntityBySlug, EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { createProperty, updatePropertyAttributes, updatePropertyOptions } from "~/utils/db/entities/properties.db.server";
import { validateProperty } from "~/utils/helpers/PropertyHelper";

type LoaderData = {
  entity: EntityWithDetails;
  properties: PropertyWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const data: LoaderData = {
    entity,
    properties: entity?.properties ?? [],
  };
  return success(data);
};

type ActionData = {
  error?: string;
  properties?: PropertyWithDetails[];
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
  const type = Number(form.get("type")) as PropertyType;
  const isDynamic = Boolean(form.get("is-dynamic"));
  const order = Number(form.get("order"));
  const isDefault = Boolean(form.get("is-default"));
  const isRequired = Boolean(form.get("is-required"));
  const isHidden = Boolean(form.get("is-hidden"));
  const isDetail = Boolean(form.get("is-detail"));

  const entityId = form.get("entity-id")?.toString() ?? "";

  if (["id", "folio", "createdAt", "createdByUser", "rows", "sort", "page", "q", "v", "workflowState", "workflowStateId"].includes(name)) {
    return badRequest({ error: name + " is a reserved property name" });
  }

  let parentId: string | null = null;
  if (entityId) {
    const parentEntity = await getEntityById(entityId);
    const idProperty = parentEntity?.properties.find((f) => f.name === "id");
    if (idProperty) {
      parentId = idProperty.id;
    }
  }

  const options: { order: number; value: string; name?: string; color?: Colors }[] = form.getAll("options[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  const attributes: { name: string; value: string }[] = form.getAll("attributes[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  if (type === PropertyType.SELECT && options.length === 0) {
    return badRequest({ error: "Add at least one option" });
  }

  if (type === PropertyType.ENTITY && !parentId) {
    return badRequest({ error: "Related entity must be set on Entity-type properties" });
  }

  const errors = await validateProperty(name, title, entity.properties);
  if (errors.length > 0) {
    return badRequest({ error: errors.join(", ") });
  }

  if (action === "create") {
    try {
      const existingOrder = entity.properties.find((f) => f.order === order);
      if (existingOrder) {
        return badRequest({ error: "Order of display already used by: " + existingOrder.name });
      }
      const property = await createProperty({
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
        parentId,
      });
      await updatePropertyOptions(property.id, options);
      await updatePropertyAttributes(property.id, attributes);
      return redirect(`/admin/entities/${params.slug}/properties`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function NewEntityPropertyRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  const navigate = useNavigate();
  return (
    <SlideOverFormLayout
      title={"Create property"}
      description={""}
      onClosed={() => navigate(`/admin/entities/${data.entity.slug}/properties`)}
      className="max-w-sm"
    >
      <PropertyForm properties={data.properties} entities={adminData.entities} />
    </SlideOverFormLayout>
  );
}

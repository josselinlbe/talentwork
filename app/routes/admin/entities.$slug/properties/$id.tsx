import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import PropertyForm from "~/components/entities/properties/PropertyForm";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { PropertyWithDetails, EntityWithDetails, getEntityById, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { deleteProperty, getProperty, updateProperty, updatePropertyOptions } from "~/utils/db/entities/properties.db.server";
import { validateProperty } from "~/utils/helpers/PropertyHelper";

type LoaderData = {
  entity: EntityWithDetails;
  item: PropertyWithDetails;
  parentEntity: EntityWithDetails | undefined;
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const item = await getProperty(params.id ?? "");
  if (!item) {
    return redirect(`/admin/entities/${params.slug}/properties`);
  }
  let parentEntity: EntityWithDetails | undefined = undefined;
  if (item.parentId) {
    const property = await getProperty(item.parentId);
    if (property) {
      parentEntity = (await getEntityById(property?.entityId)) ?? undefined;
    }
  }
  const data: LoaderData = {
    entity,
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

  const existing = await getProperty(params.id ?? "");

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const name = form.get("name")?.toString() ?? "";
  const title = form.get("title")?.toString() ?? "";
  const type = Number(form.get("type")) as PropertyType;
  const isDynamic = Boolean(form.get("is-dynamic"));
  const order = Number(form.get("order"));
  const isRequired = Boolean(form.get("is-required"));
  const isHidden = Boolean(form.get("is-hidden"));
  const isDetail = Boolean(form.get("is-detail"));
  const pattern = form.get("pattern")?.toString() ?? "";
  const min = form.get("min");
  const max = form.get("max");
  const step = form.get("step");
  const rows = form.get("rows");
  const defaultValue = form.get("default-value");

  const maxSize = form.get("max-size");
  const acceptFileTypes = form.get("accept-file-types");

  const uppercase = form.get("uppercase");
  const lowercase = form.get("lowercase");
  const hintText = form.get("hint-text");
  const helpText = form.get("help-text");
  const placeholder = form.get("placeholder");
  const icon = form.get("icon");

  const entityId = form.get("entity-id")?.toString() ?? "";

  if (name === "rows") {
    return badRequest({ error: "Rows is a reserved word" });
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

  if (type === PropertyType.SELECT && options.length === 0) {
    return badRequest({ error: "Add at least one option" });
  }

  if (type === PropertyType.ENTITY && !parentId) {
    return badRequest({ error: "Related entity must be set on Entity-type properties" });
  }

  const errors = await validateProperty(name, title, entity.properties, existing);
  if (errors.length > 0) {
    return badRequest({ error: errors.join(", ") });
  }

  if (action === "edit") {
    try {
      const existingOrder = entity.properties.find((f) => f.id !== existing?.id && f.order === order);
      if (existingOrder) {
        return badRequest({ error: "Order of display already used by: " + existingOrder.name });
      }
      await updateProperty(
        params.id ?? "",
        {
          name,
          title,
          type,
          isDynamic,
          order,
          isDefault: existing?.isDefault ?? false,
          isRequired,
          isHidden,
          isDetail,
          parentId,
        },
        {
          pattern,
          min: min ? Number(min) : null,
          max: max ? Number(max) : null,
          step: step?.toString() ?? null,
          rows: rows ? Number(rows) : null,
          defaultValue: defaultValue?.toString() ?? null,
          maxSize: maxSize ? Number(maxSize) : null,
          acceptFileTypes: acceptFileTypes?.toString() ?? null,
          uppercase: uppercase !== undefined ? Boolean(uppercase) : null,
          lowercase: lowercase !== undefined ? Boolean(lowercase) : null,
          hintText: hintText?.toString() ?? null,
          helpText: helpText?.toString() ?? null,
          placeholder: placeholder?.toString() ?? null,
          icon: icon?.toString() ?? null,
        }
      );
      await updatePropertyOptions(params.id ?? "", options);
      return redirect(`/admin/entities/${params.slug}/properties`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    const existingProperty = await getProperty(id);
    if (!existingProperty) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteProperty(id);
    return redirect(`/admin/entities/${params.slug}/properties`);
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function EditEntityPropertyRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  const navigate = useNavigate();
  return (
    <SlideOverFormLayout
      title={"Update property"}
      description={data.item.title}
      onClosed={() => navigate(`/admin/entities/${data.entity.slug}/properties`)}
      className="max-w-sm"
    >
      <PropertyForm item={data.item} properties={[]} entities={adminData.entities} parentEntity={data.parentEntity} />
    </SlideOverFormLayout>
  );
}

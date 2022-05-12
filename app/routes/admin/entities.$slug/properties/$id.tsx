import { EntityPropertyOption } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData } from "remix";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import EntityPropertyForm from "~/components/entities/EntityPropertyForm";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityPropertyWithDetails, getEntityBySlug } from "~/utils/db/entities.db.server";
import { deleteEntityProperty, getEntityProperty, updateEntityProperty, updateEntityPropertyOptions } from "~/utils/db/entityProperties.db.server";
import { validateEntityProperty } from "~/utils/helpers/EntityPropertyHelper";

type LoaderData = {
  entityId: string;
  item: EntityPropertyWithDetails;
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
  const data: LoaderData = {
    entityId: entity.id,
    item,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const success = (data: ActionData) => json(data, { status: 200 });
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
  const options: { order: number; value: string }[] = form.getAll("options[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

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
  return <EntityPropertyForm item={data.item} properties={[]} />;
}

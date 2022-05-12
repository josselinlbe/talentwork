import { ActionFunction, json, LoaderFunction, Outlet, redirect, useActionData, useLoaderData, useNavigate } from "remix";
import EntityPropertiesList from "~/components/entities/EntityPropertiesList";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityPropertyWithDetails, getEntityBySlug } from "~/utils/db/entities.db.server";
import { deleteEntityProperty, getEntityProperty } from "~/utils/db/entityProperties.db.server";

type LoaderData = {
  entityId: string;
  properties: EntityPropertyWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const data: LoaderData = {
    entityId: entity.id,
    properties: entity.properties,
  };
  return success(data);
};

type ActionData = {
  error?: string;
  properties?: EntityPropertyWithDetails[];
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
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

  if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    const existingProperty = await getEntityProperty(id);
    if (!existingProperty) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteEntityProperty(id);
    return success({
      properties: (await getEntityBySlug(params.slug ?? ""))?.properties,
      deleted: true,
    });
    // return redirect(`/admin/entities/${params.slug}/properties`);
  }
  return badRequest(t("shared.invalidForm"));
};

export default function EditEntityIndexRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <EntityPropertiesList entityId={data.entityId} items={actionData?.properties ?? data.properties} />
      <Outlet />
    </>
  );
}

import { EntityRow } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData } from "remix";
import EntityRowsList from "~/components/entities/EntityRowsList";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities.db.server";
import { EntityRowWithDetails, getAllEntityRows } from "~/utils/db/entityRows.db.server";

type LoaderData = {
  entity: EntityWithDetails;
  items: EntityRowWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const items = await getAllEntityRows(entity.id);
  const data: LoaderData = {
    entity,
    items,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  return badRequest(t("shared.invalidForm"));
};

export default function EditEntityIndexRoute() {
  const data = useLoaderData<LoaderData>();
  return <EntityRowsList entity={data.entity} items={data.items} withTenant />;
}

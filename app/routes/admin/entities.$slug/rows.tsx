import { Row } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData } from "remix";
import RowsList from "~/components/entities/rows/RowsList";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails, getAllRows } from "~/utils/db/entities/rows.db.server";

type LoaderData = {
  entity: EntityWithDetails;
  items: RowWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const items = await getAllRows(entity.id);
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
  return <RowsList entity={data.entity} items={data.items} withTenant />;
}

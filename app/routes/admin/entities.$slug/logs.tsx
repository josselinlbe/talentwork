import { Log } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData } from "remix";
import LogsTable from "~/components/app/events/LogsTable";
import { i18nHelper } from "~/locale/i18n.utils";
import { getEntityBySlug } from "~/utils/db/entities.db.server";
import { getAllEntityLogs, getEntityRowLogs, LogWithDetails } from "~/utils/db/logs.db.server";

type LoaderData = {
  items: LogWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const item = await getEntityBySlug(params.slug ?? "");
  if (!item) {
    return redirect("/admin/entities");
  }
  const items = await getAllEntityLogs(item.id);
  const data: LoaderData = {
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
  return (
    <div>
      <LogsTable withTenant={true} items={data.items} />
    </div>
  );
}

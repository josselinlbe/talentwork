import { ActionFunction, json, LoaderFunction, Outlet, redirect, useLoaderData } from "remix";
import WorkflowStatesTable from "~/components/core/workflows/WorkflowStatesTable";
import { i18nHelper } from "~/locale/i18n.utils";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { EntityWorkflowStateWithSteps, getWorkflowStates, updateWorkflowState } from "~/utils/db/workflows/workflowStates.db.server";

type LoaderData = {
  items: EntityWorkflowStateWithSteps[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const items = await getWorkflowStates(entity.id);
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

  const item = await getEntityBySlug(params.slug ?? "");
  if (!item) {
    return redirect("/admin/entities");
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "set-orders") {
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });
    await Promise.all(
      items.map(async ({ id, order }) => {
        await updateWorkflowState(id, { order: Number(order) });
      })
    );
    return json({
      items: await getWorkflowStates(item.id),
    });
  }
};

export default function EntityWorkflowRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <WorkflowStatesTable items={data.items} />

      <Outlet />
    </div>
  );
}

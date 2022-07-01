import { json, LoaderFunction, Outlet, redirect, useLoaderData } from "remix";
import WorkflowStepsTable from "~/components/core/workflows/WorkflowStepsTable";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getWorkflowSteps, WorkflowStepWithDetails } from "~/utils/db/workflows/workflowSteps.db.server";

type LoaderData = {
  items: WorkflowStepWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const items = await getWorkflowSteps(entity.id);
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function EntityWorkflowRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <WorkflowStepsTable items={data.items} />

      <Outlet />
    </div>
  );
}

import { EntityWorkflowState } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData, useNavigate, useParams } from "remix";
import EntityWorkflowStepForm from "~/components/entities/workflow/EntityWorkflowStepForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getWorkflowStates } from "~/utils/db/workflows/workflowStates.db.server";
import { deleteWorkflowStep, EntityWorkflowStepWithDetails, getWorkflowStep, updateWorkflowStep } from "~/utils/db/workflows/workflowSteps.db.server";

type LoaderData = {
  states: EntityWorkflowState[];
  item: EntityWorkflowStepWithDetails;
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const item = await getWorkflowStep(params.id ?? "");
  if (!item) {
    return redirect(`/admin/entities/${params.slug}/workflow/steps`);
  }
  const data: LoaderData = {
    item,
    states: await getWorkflowStates(entity.id),
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

  const existing = await getWorkflowStep(params.id ?? "");
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  if (action === "edit") {
    try {
      await updateWorkflowStep(params.id ?? "", {
        entityId: entity.id,
        action: form.get("action-title")?.toString() ?? "",
        fromStateId: form.get("from-state-id")?.toString() ?? "",
        toStateId: form.get("to-state-id")?.toString() ?? "",
        assignTo: "private",
      });
      return redirect(`/admin/entities/${params.slug}/workflow/steps`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    await deleteWorkflowStep(existing.id);
    return redirect(`/admin/entities/${params.slug}/workflow/steps`);
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function EditEntityWorkflowStepRoute() {
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  const navigate = useNavigate();
  function close() {
    navigate(`/admin/entities/${params.slug}/workflow/steps`);
  }
  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EntityWorkflowStepForm states={data.states} item={data.item} />
    </OpenModal>
  );
}

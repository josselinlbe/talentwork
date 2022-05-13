import { ActionFunction, json, redirect, useNavigate, useParams } from "remix";
import EntityWebhookForm from "~/components/entities/webhooks/EntityWebhookForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { getEntityBySlug } from "~/utils/db/entities.db.server";
import { createEntityWebhook, getEntityWebhook } from "~/utils/db/entityWebhooks.db.server";

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

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const webhookAction = form.get("webhook-action")?.toString() ?? "";
  const method = form.get("webhook-method")?.toString() ?? "";
  const endpoint = form.get("webhook-endpoint")?.toString() ?? "";

  if (action === "create") {
    try {
      await createEntityWebhook({
        entityId: entity.id,
        action: webhookAction,
        method,
        endpoint,
      });
      return redirect(`/admin/entities/${params.slug}/webhooks`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest(t("shared.invalidForm"));
};

export default function NewEntityWebhookRoute() {
  const params = useParams();
  const navigate = useNavigate();
  function close() {
    navigate(`/admin/entities/${params.slug}/webhooks`);
  }
  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EntityWebhookForm />
    </OpenModal>
  );
}

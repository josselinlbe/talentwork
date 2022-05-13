import { EntityWebhook } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData, useNavigate, useParams } from "remix";
import EntityWebhookForm from "~/components/entities/webhooks/EntityWebhookForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { getEntityBySlug } from "~/utils/db/entities.db.server";
import { deleteEntityWebhook, getEntityWebhook, updateEntityWebhook } from "~/utils/db/entityWebhooks.db.server";

type LoaderData = {
  entityId: string;
  item: EntityWebhook;
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const item = await getEntityWebhook(params.id ?? "");
  if (!item) {
    return redirect(`/admin/entities/${params.slug}/webhooks`);
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
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }

  const existing = await getEntityWebhook(params.id ?? "");
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const webhookAction = form.get("webhook-action")?.toString() ?? "";
  const method = form.get("webhook-method")?.toString() ?? "";
  const endpoint = form.get("webhook-endpoint")?.toString() ?? "";

  if (action === "edit") {
    try {
      await updateEntityWebhook(params.id ?? "", {
        action: webhookAction,
        method,
        endpoint,
      });
      return redirect(`/admin/entities/${params.slug}/webhooks`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    await deleteEntityWebhook(existing.id);
    return redirect(`/admin/entities/${params.slug}/webhooks`);
  }
  return badRequest(t("shared.invalidForm"));
};

export default function EditEntityWebhookRoute() {
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  const navigate = useNavigate();
  function close() {
    navigate(`/admin/entities/${params.slug}/webhooks`);
  }
  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EntityWebhookForm item={data.item} />
    </OpenModal>
  );
}

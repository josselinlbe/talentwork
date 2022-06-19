import { ActionFunction, json, LoaderFunction, redirect, useLoaderData, useNavigate, useParams } from "remix";
import ApiKeyForm from "~/components/core/apiKeys/ApiKeyForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppData } from "~/utils/data/useAppData";
import { ApiKeyWithDetails, deleteApiKey, getApiKeyById, updateApiKey } from "~/utils/db/apiKeys.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  item: ApiKeyWithDetails;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const item = await getApiKeyById(params.id ?? "");
  if (!item) {
    return redirect(UrlUtils.currentTenantUrl(params, "settings/api/keys"));
  }
  const data: LoaderData = {
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
  const tenantUrl = await getTenantUrl(params);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const existing = await getApiKeyById(params.id ?? "");
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }
  if (action === "edit") {
    await verifyUserHasPermission(request, "app.settings.apiKeys.update", tenantUrl.tenantId);
    const entities: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = form
      .getAll("entities[]")
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
    await updateApiKey(
      params.id ?? "",
      {
        alias: form.get("alias")?.toString() ?? "",
        expires: new Date(form.get("expires")?.toString() ?? ""),
        active: Boolean(form.get("active")),
      },
      entities
    );
    return redirect(UrlUtils.currentTenantUrl(params, "settings/api/keys"));
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "app.settings.apiKeys.delete", tenantUrl.tenantId);
    await deleteApiKey(params.id ?? "");
    return redirect(UrlUtils.currentTenantUrl(params, "settings/api/keys"));
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function ApiEditKeyRoute() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const appData = useAppData();
  const params = useParams();
  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => navigate(UrlUtils.currentTenantUrl(params, "settings/api/keys"))}>
        <ApiKeyForm
          entities={appData.entities}
          item={data.item}
          canUpdate={appData.permissions.includes("app.settings.apiKeys.update")}
          canDelete={appData.permissions.includes("app.settings.apiKeys.delete")}
        />
      </OpenModal>
    </>
  );
}

import { ActionFunction, json, LoaderFunction, redirect, useNavigate, useParams } from "remix";
import ApiKeyForm from "~/components/core/apiKeys/ApiKeyForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppData } from "~/utils/data/useAppData";
import { createApiKey, getApiKeys } from "~/utils/db/apiKeys.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getTenantUrl } from "~/utils/services/urlService";
import { getUserInfo } from "~/utils/session.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.settings.apiKeys.create", tenantUrl.tenantId);
  return json({});
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const alias = form.get("alias")?.toString() ?? "";
    const myApiKeys = await getApiKeys(tenantUrl.tenantId);
    if (myApiKeys.find((f) => f.alias === alias)) {
      return badRequest({ error: "Existing API Key with alias: " + alias });
    }
    const entities: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = form
      .getAll("entities[]")
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
    await createApiKey(
      {
        tenantId: tenantUrl.tenantId,
        createdByUserId: userInfo.userId,
        alias,
        max: 100,
        expires: new Date(form.get("expires")?.toString() ?? ""),
        active: Boolean(form.get("active")),
      },
      entities
    );
    return redirect(UrlUtils.currentTenantUrl(params, "settings/api/keys"));
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function ApiNewKeyRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const appData = useAppData();
  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => navigate(UrlUtils.currentTenantUrl(params, "settings/api/keys"))}>
        <ApiKeyForm entities={appData.entities} />
      </OpenModal>
    </>
  );
}

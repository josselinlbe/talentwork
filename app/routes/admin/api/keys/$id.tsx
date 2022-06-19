import { Tenant } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData, useNavigate } from "remix";
import ApiKeyForm from "~/components/core/apiKeys/ApiKeyForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { ApiKeyWithDetails, deleteApiKey, getApiKeyById, updateApiKey } from "~/utils/db/apiKeys.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  tenants: Tenant[];
  item: ApiKeyWithDetails;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const item = await getApiKeyById(params.id ?? "");
  if (!item) {
    return redirect("/admin/api");
  }
  const tenants = await adminGetAllTenants();
  const data: LoaderData = {
    item,
    tenants,
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
  const existing = await getApiKeyById(params.id ?? "");
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }
  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.apiKeys.update");
    const entities: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = form
      .getAll("entities[]")
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
    await updateApiKey(
      params.id ?? "",
      {
        alias: form.get("alias")?.toString() ?? "",
        max: Number(form.get("max")),
        expires: new Date(form.get("expires")?.toString() ?? ""),
        active: Boolean(form.get("active")),
      },
      entities
    );
    return redirect(`/admin/api/keys`);
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.apiKeys.delete");
    await deleteApiKey(params.id ?? "");
    return redirect(`/admin/api/keys`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function AdminApiEditKeyRoute() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const adminData = useAdminData();
  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => navigate(`/admin/api`)}>
        <ApiKeyForm
          entities={adminData.entities}
          tenants={data.tenants}
          item={data.item}
          canUpdate={adminData.permissions.includes("admin.apiKeys.update")}
          canDelete={adminData.permissions.includes("admin.apiKeys.delete")}
        />
      </OpenModal>
    </>
  );
}

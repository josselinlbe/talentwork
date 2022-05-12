import { Tenant } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData, useNavigate } from "remix";
import ApiKeyForm from "~/components/core/apiKeys/ApiKeyForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { createApiKey } from "~/utils/db/apiKeys.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  tenants: Tenant[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const tenants = await adminGetAllTenants();
  const data: LoaderData = {
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
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const entities: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = form
      .getAll("entities[]")
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
    await createApiKey(
      {
        tenantId: form.get("tenant-id")?.toString() ?? "",
        createdByUserId: userInfo.userId,
        alias: form.get("alias")?.toString() ?? "",
        max: Number(form.get("max")),
        expires: new Date(form.get("expires")?.toString() ?? ""),
        active: Boolean(form.get("active")),
      },
      entities
    );
    return redirect(`/admin/api/keys`);
  } else {
    return badRequest(t("shared.invalidForm"));
  }
};

export default function AdminApiNewKeyRoute() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const adminData = useAdminData();
  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => navigate(`/admin/api`)}>
        <ApiKeyForm entities={adminData.entities} tenants={data.tenants} />
      </OpenModal>
    </>
  );
}

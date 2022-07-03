import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useAppData } from "~/utils/data/useAppData";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenant, getTenantBySlug, updateTenant } from "~/utils/db/tenants.db.server";
import { getTenantUrl } from "~/utils/services/urlService";
import UpdateTenantDetailsForm from "~/components/core/tenants/UpdateTenantDetailsForm";
import { createLog } from "~/utils/db/logs.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useRef } from "react";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { deleteAndCancelTenant } from "~/utils/services/tenantService";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.settings.account.view", tenantUrl.tenantId);
  let { t } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("models.tenant.object")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

type ActionData = {
  updateDetailsError?: string;
  success?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  if (action === "edit") {
    await verifyUserHasPermission(request, "app.settings.account.update", tenantUrl.tenantId);
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString().toLowerCase() ?? "";
    const icon = form.get("icon")?.toString() ?? "";
    if ((name?.length ?? 0) < 2) {
      return badRequest({
        updateDetailsError: "Tenant name must have at least 2 characters",
      });
    }
    if (!slug || slug.length < 5) {
      return badRequest({
        updateDetailsError: "Tenant slug must have at least 5 characters",
      });
    }

    if (["settings"].includes(slug.toLowerCase())) {
      return badRequest({
        updateDetailsError: "Slug cannot be " + slug,
      });
    }
    const regexExp = /^[a-z0-9]+(?:-[a-z0-9]+)*$/g;
    if (!regexExp.test(slug)) {
      return badRequest({
        updateDetailsError: "Invalid slug, use only lowercase letters and/or numbers",
      });
    }
    if (slug.includes(" ")) {
      return badRequest({
        updateDetailsError: "Slug cannot contain white spaces",
      });
    }

    const existing = await getTenant(tenantUrl.tenantId);
    await createLog(request, tenantUrl, "Update tenant details", JSON.stringify({ name, slug }));
    if (existing?.slug !== slug) {
      const existingSlug = await getTenantBySlug(slug);
      if (existingSlug) {
        return badRequest({
          updateDetailsError: "Slug already taken",
        });
      }
      await updateTenant({ name, icon, slug }, tenantUrl.tenantId);
      return redirect(`/app/${slug}/settings/account`);
    } else {
      await updateTenant({ name, icon, slug }, tenantUrl.tenantId);
      const actionData: ActionData = {
        success: t("settings.tenant.updated"),
      };
      return json(actionData);
    }
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "app.settings.account.delete", tenantUrl.tenantId);
    await deleteAndCancelTenant(tenantUrl.tenantId);
    return redirect("/app");
  } else {
    return badRequest({ updateDetailsError: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function TenantRoute() {
  const appData = useAppData();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function deleteAccount() {
    confirmDelete.current?.show(t("settings.danger.confirmDeleteTenant"), t("shared.confirm"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function confirmDeleteTenant() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, { method: "post" });
  }

  return (
    <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="md:grid lg:grid-cols-3 md:gap-2">
        <div className="md:col-span-1">
          <div className="sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{t("settings.tenant.general")}</h3>
            <p className="mt-1 text-xs leading-5 text-gray-600">{t("settings.tenant.generalDescription")}</p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <UpdateTenantDetailsForm
            disabled={!appData.permissions.includes("app.settings.account.update")}
            tenant={appData.currentTenant}
            actionData={actionData}
          />
        </div>
      </div>

      {/*Separator */}
      <div className="block">
        <div className="py-5">
          <div className="border-t border-gray-200"></div>
        </div>
      </div>

      {/*Danger */}
      <div className="md:grid lg:grid-cols-3 md:gap-2">
        <div className="md:col-span-1">
          <div className="sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{t("settings.danger.title")}</h3>
            <p className="mt-1 text-xs leading-5 text-gray-600">{t("settings.danger.description")}</p>
          </div>
        </div>
        <div className="mt-12 md:mt-0 md:col-span-2">
          <div>
            <input hidden type="text" name="action" value="deleteAccount" readOnly />
            <div className="bg-white shadow sm:rounded-sm">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete account</h3>
                <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                  <p>Delete organization and cancel subscriptions.</p>
                </div>
                <div className="mt-5">
                  <ButtonPrimary disabled={!appData.permissions.includes("app.settings.account.delete")} destructive={true} onClick={deleteAccount}>
                    {t("settings.danger.deleteAccount")}
                  </ButtonPrimary>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteTenant} />
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData } from "remix";
import { useAppData } from "~/utils/data/useAppData";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenant, getTenantBySlug, updateTenant } from "~/utils/db/tenants.db.server";
import { getTenantUrl } from "~/utils/services/urlService";
import UpdateTenantDetailsForm from "~/components/core/tenants/UpdateTenantDetailsForm";
import { createUserEvent } from "~/utils/db/userEvents.db.server";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("models.tenant.object")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const form = await request.formData();
  const type = form.get("type")?.toString() ?? "";

  if (type === "update-tenant-details") {
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString().toLowerCase() ?? "";
    const icon = form.get("icon")?.toString() ?? "";
    if ((name?.length ?? 0) < 2) {
      return badRequest({
        error: "Tenant name must have at least 2 characters",
      });
    }
    if (!slug || slug.length < 5) {
      return badRequest({
        error: "Tenant slug must have at least 5 characters",
      });
    }

    if (["settings"].includes(slug.toLowerCase())) {
      return badRequest({
        error: "Slug cannot be " + slug,
      });
    }
    const regexExp = /^[a-z0-9]+(?:-[a-z0-9]+)*$/g;
    if (!regexExp.test(slug)) {
      return badRequest({
        error: "Invalid slug, use only lowercase letters and/or numbers",
      });
    }
    if (slug.includes(" ")) {
      return badRequest({
        error: "Slug cannot contain white spaces",
      });
    }

    const existing = await getTenant(tenantUrl.tenantId);
    await createUserEvent(request, tenantUrl, "Update tenant details", JSON.stringify({ name, slug }));
    if (existing?.slug !== slug) {
      const existingSlug = await getTenantBySlug(slug);
      if (existingSlug) {
        return badRequest({
          error: "Slug already taken",
        });
      }
      await updateTenant({ name, icon, slug }, tenantUrl.tenantId);
      return redirect(`/app/${slug}/settings/tenant`);
    } else {
      await updateTenant({ name, icon, slug }, tenantUrl.tenantId);
      const actionData: ActionData = {
        success: t("settings.tenant.updated"),
      };
      return json(actionData);
    }
  } else if (type === "update-tenant-subscription") {
    return json({ success: "Updated" });
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function TenantRoute() {
  const appData = useAppData();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();

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
          <UpdateTenantDetailsForm tenant={appData.currentTenant} actionData={actionData} />
        </div>
      </div>
    </div>
  );
}

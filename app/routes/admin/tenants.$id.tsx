import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useParams, useSubmit } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { deleteTenant, getTenant, getTenantBySlug, updateTenant } from "~/utils/db/tenants.db.server";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { Tenant } from "@prisma/client";
import UpdateTenantDetailsForm from "~/components/core/tenants/UpdateTenantDetailsForm";
import { createAdminUserEvent } from "~/utils/db/userEvents.db.server";
import UsersTable from "~/components/core/users/UsersTable";
import { adminGetAllTenantUsers } from "~/utils/db/users.db.server";
import UpdateTenantSubscriptionForm from "~/components/core/tenants/UpdateTenantSubscriptionForm";
import { getTenantSubscription, TenantSubscriptionWithDetails, updateTenantStripeSubscriptionId } from "~/utils/db/tenantSubscriptions.db.server";
import { getSubscriptionPrice, getSubscriptionPrices, SubscriptionPriceWithProduct } from "~/utils/db/subscriptionProducts.db.server";
import { cancelStripeSubscription, createStripeSubscription } from "~/utils/stripe.server";
import Stripe from "stripe";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useAdminData } from "~/utils/data/useAdminData";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";

type LoaderData = {
  title: string;
  tenant: Tenant;
  users: Awaited<ReturnType<typeof adminGetAllTenantUsers>>;
  subscription: TenantSubscriptionWithDetails | null;
  subscriptionPrices: SubscriptionPriceWithProduct[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const tenant = await getTenant(params.id);
  if (!tenant) {
    return redirect("/admin/tenants");
  }
  const users = await adminGetAllTenantUsers(tenant.id);
  const subscription = await getTenantSubscription(params.id ?? "");
  const subscriptionPrices = await getSubscriptionPrices();

  const data: LoaderData = {
    title: `${t("models.tenant.object")} | ${process.env.APP_NAME}`,
    tenant,
    users,
    subscription,
    subscriptionPrices,
  };
  return json(data);
};

type ActionData = {
  updateSubscriptionSuccess?: string;
  updateDetailsError?: string;
  updateSubscriptionError?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const form = await request.formData();
  const type = form.get("type")?.toString() ?? "";

  if (type === "update-tenant-details") {
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

    const existing = await getTenant(params.id);
    if (existing?.slug !== slug) {
      const existingSlug = await getTenantBySlug(slug);
      if (existingSlug) {
        return badRequest({
          updateDetailsError: "Slug already taken",
        });
      }
    }
    await createAdminUserEvent(request, "Update tenant details", JSON.stringify({ name, slug }));
    await updateTenant({ name, icon, slug }, params.id);
    return json({
      success: t("settings.tenant.updated"),
    });
  } else if (type === "update-tenant-subscription") {
    const tenantSubscription = await getTenantSubscription(params.id ?? "");
    const priceId = form.get("subscription-price-id")?.toString();
    if (!priceId) {
      return badRequest({ updateSubscriptionError: "Invalid plan" });
    }
    if (!tenantSubscription?.stripeCustomerId) {
      return badRequest({ updateSubscriptionError: "Invalid customer ID" });
    }

    const subscriptionPrice = await getSubscriptionPrice(priceId);
    let newSubscription: Stripe.Subscription | null;
    try {
      newSubscription = await createStripeSubscription(tenantSubscription?.stripeCustomerId ?? "", subscriptionPrice?.stripeId ?? "");
    } catch (error: any) {
      return badRequest({ updateSubscriptionError: error.message });
    }
    if (!newSubscription) {
      return badRequest({ updateSubscriptionError: "Could not create customer subscription" });
    }
    if (tenantSubscription.stripeSubscriptionId) {
      await cancelStripeSubscription(tenantSubscription.stripeSubscriptionId);
    }

    await updateTenantStripeSubscriptionId(params.id ?? "", {
      subscriptionPriceId: priceId,
      stripeSubscriptionId: newSubscription.id,
    });

    return json({ updateSubscriptionSuccess: "Subscription updated" });
  } else if (type === "delete-tenant") {
    const tenantSubscription = await getTenantSubscription(params.id ?? "");
    if (tenantSubscription?.stripeSubscriptionId) {
      await cancelStripeSubscription(tenantSubscription?.stripeSubscriptionId);
    }
    await deleteTenant(params.id ?? "");
    return redirect("/admin/tenants");
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function TenantRoute() {
  const adminData = useAdminData();
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.updateSubscriptionSuccess) {
      successModal.current?.show(actionData?.updateSubscriptionSuccess);
    }
    if (actionData?.updateSubscriptionError) {
      errorModal.current?.show(actionData?.updateSubscriptionError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function adminHasPermission(action: "delete-tenant") {
    switch (action) {
      case "delete-tenant":
        return adminData.user.admin?.role === TenantUserRole.OWNER;
      default:
        return false;
    }
  }

  function deleteAccount() {
    confirmDelete.current?.show(t("settings.danger.confirmDeleteTenant"), t("shared.confirm"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function confirmDeleteTenant() {
    const form = new FormData();
    form.set("type", "delete-tenant");
    submit(form, { method: "post" });
  }

  return (
    <div>
      <Breadcrumb
        home="/admin/tenants"
        menu={[
          { title: t("models.tenant.plural"), routePath: "/admin/tenants" },
          { title: data.tenant?.name ?? "", routePath: "/admin/tenants/" + params.id },
        ]}
      ></Breadcrumb>

      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        {/* Tenant Details */}
        <div className="md:grid lg:grid-cols-3 md:gap-2">
          <div className="md:col-span-1">
            <div className="sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{t("settings.tenant.general")}</h3>
              <p className="mt-1 text-xs leading-5 text-gray-600">{t("settings.tenant.generalDescription")}</p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <UpdateTenantDetailsForm tenant={data.tenant} actionData={actionData} />
          </div>
        </div>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-gray-200"></div>
          </div>
        </div>

        {/* Tenant Users */}
        <div className="md:grid lg:grid-cols-3 md:gap-2">
          <div className="md:col-span-1">
            <div className="sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{t("models.user.plural")}</h3>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <UsersTable items={data.users} />
          </div>
        </div>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-gray-200"></div>
          </div>
        </div>

        {/* Tenant Subscription */}
        <div className="md:grid lg:grid-cols-3 md:gap-2">
          <div className="md:col-span-1">
            <div className="sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{t("models.subscriptionProduct.object")}</h3>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <UpdateTenantSubscriptionForm tenant={data.tenant} subscription={data.subscription} subscriptionPrices={data.subscriptionPrices} />
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
              <input hidden type="text" name="type" value="deleteAccount" readOnly />
              <div className="bg-white shadow sm:rounded-sm">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete tenant</h3>
                  <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                    <p>Delete organization and cancel subscriptions.</p>
                  </div>
                  <div className="mt-5">
                    <ButtonPrimary disabled={!adminHasPermission("delete-tenant")} destructive={true} onClick={deleteAccount}>
                      {t("settings.danger.deleteAccount")}
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteTenant} />
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

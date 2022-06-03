import { useTranslation } from "react-i18next";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useRef, useEffect, useState } from "react";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useSubmit } from "remix";
import { getAllSubscriptionProducts, getSubscriptionPrice, getSubscriptionPriceByStripeId } from "~/utils/db/subscriptionProducts.db.server";
import {
  cancelStripeSubscription,
  createStripeCustomer,
  createStripeSession,
  getStripeInvoices,
  getStripeSession,
  getStripeSubscription,
} from "~/utils/stripe.server";
import { getUserInfo } from "~/utils/session.server";
import { requireOwnerOrAdminRole } from "~/utils/loaders.middleware";
import { getUser } from "~/utils/db/users.db.server";
import { SubscriptionPrice, SubscriptionProduct } from "@prisma/client";
import ChangeSubscription from "~/components/core/settings/subscription/ChangeSubscription";
import clsx from "~/utils/shared/ClassesUtils";
import { useAppData } from "~/utils/data/useAppData";
import MySubscriptionFeatures from "~/components/core/settings/subscription/MySubscriptionFeatures";
import { DashboardLoaderData, loadDashboardData } from "~/utils/data/useDashboardData";
import { i18nHelper } from "~/locale/i18n.utils";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import MyInvoices from "~/components/core/settings/subscription/MyInvoices";
import Stripe from "stripe";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";
import {
  getOrPersistTenantSubscription,
  getTenantSubscription,
  updateTenantSubscriptionCustomerId,
  updateTenantStripeSubscriptionId,
} from "~/utils/db/tenantSubscriptions.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { createLog } from "~/utils/db/logs.db.server";
import { PricingModel } from "~/application/enums/subscriptions/PricingModel";
import { getPlanFeaturesUsage } from "~/utils/services/subscriptionService";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";

type LoaderData = DashboardLoaderData & {
  title: string;
  items: Awaited<ReturnType<typeof getAllSubscriptionProducts>>;
  myInvoices: Stripe.Invoice[];
  myFeatures: PlanFeatureUsageDto[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  await requireOwnerOrAdminRole(request, params);
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);

  const tenant = await getTenant(tenantUrl.tenantId);
  if (!tenant) {
    return badRequest({ error: "Invalid tenant with id: " + tenantUrl.tenantId });
  }

  const tenantSubscription = await getOrPersistTenantSubscription(tenantUrl.tenantId);

  if (!user) {
    return badRequest({ error: "Invalid user" });
  }

  if (!tenantSubscription.stripeCustomerId) {
    const customer = await createStripeCustomer(user.email, tenant.name);
    if (customer) {
      tenantSubscription.stripeCustomerId = customer.id;
      await updateTenantSubscriptionCustomerId(tenantUrl.tenantId, {
        stripeCustomerId: customer.id,
      });
    }
  }

  const url = new URL(request.url);
  const session_id = url.searchParams.get("session_id");
  if (session_id) {
    try {
      const session = await getStripeSession(session_id);
      if (session.subscription) {
        const stripeSubscription = await getStripeSubscription(session.subscription.toString());
        let price: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null = null;
        let quantity: number = 0;
        if (stripeSubscription && stripeSubscription?.items.data.length > 0) {
          const data = stripeSubscription?.items.data[0];
          price = await getSubscriptionPriceByStripeId(data.plan.id);
          if (data.quantity) {
            quantity = data.quantity;
          }
        }
        // console.log({ session: JSON.stringify(session) });
        // await updateStripeCustomerPaymentMethod(tenantSubscription.stripeCustomerId,)
        await updateTenantStripeSubscriptionId(tenantUrl.tenantId, {
          subscriptionPriceId: price?.id ?? "",
          stripeSubscriptionId: session.subscription.toString(),
          quantity,
        });
        await createLog(request, tenantUrl, "Subscribed", t(price?.subscriptionProduct.title ?? ""));
        return redirect(UrlUtils.currentTenantUrl(params, `settings/subscription`));
      }
    } catch (e) {}
  }

  const stripeSubscription = await getStripeSubscription(tenantSubscription.stripeSubscriptionId ?? "");
  // let mySubscription: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null = null;
  if (stripeSubscription && stripeSubscription?.items.data.length > 0) {
    // mySubscription = await getSubscriptionPriceByStripeId(stripeSubscription?.items.data[0].plan.id);
  } else if (tenantSubscription.stripeSubscriptionId) {
    await updateTenantStripeSubscriptionId(tenantUrl.tenantId, {
      subscriptionPriceId: null,
      stripeSubscriptionId: null,
      quantity: 0,
    });
  }

  const myInvoices = (await getStripeInvoices(tenantSubscription.stripeCustomerId ?? "")) ?? [];

  const myFeatures = await getPlanFeaturesUsage(tenantUrl.tenantId);

  const dashboardData = await loadDashboardData(params);

  const items = await getAllSubscriptionProducts(true);
  const data: LoaderData = {
    myInvoices,
    title: `${t("app.navbar.subscription")} | ${process.env.APP_NAME}`,
    items,
    myFeatures,
    ...dashboardData,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  const tenantSubscription = await getTenantSubscription(tenantUrl.tenantId);
  const form = await request.formData();

  const action = form.get("action")?.toString();
  let quantity: number = 1;
  const priceId = form.get("price-id")?.toString();
  const price = await getSubscriptionPrice(priceId ?? "");

  if (price?.subscriptionProduct.model === PricingModel.PER_SEAT) {
    quantity = Number(form.get("quantity") ?? 0);
    if (quantity <= 0) {
      return badRequest({ error: "Quantity must be set" });
    }
  }

  if (!tenantSubscription || !tenantSubscription?.stripeCustomerId) {
    return badRequest({
      error: "Invalid stripe customer",
    });
  }
  if (action === "subscribe") {
    if (!priceId || !price) {
      return badRequest({
        error: "Invalid price: " + priceId,
      });
    }
    const session = await createStripeSession(request, tenantSubscription.stripeCustomerId, price.stripeId, quantity);
    if (!session || !session.url) {
      return badRequest({
        error: "Could not update subscription",
      });
    }
    return redirect(session.url);
  } else if (action === "cancel") {
    if (!tenantSubscription.stripeSubscriptionId) {
      return badRequest({
        error: "Not subscribed",
      });
    }
    await cancelStripeSubscription(tenantSubscription.stripeSubscriptionId);
    await updateTenantStripeSubscriptionId(tenantUrl.tenantId, {
      subscriptionPriceId: null,
      stripeSubscriptionId: null,
      quantity: 0,
    });
    const actionData: ActionData = {
      success: "Successfully cancelled",
    };
    return json(actionData);
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function SubscriptionRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmModal = useRef<RefConfirmModal>(null);

  const [billingPeriod, setBillingPeriod] = useState<SubscriptionBillingPeriod>(
    appData.mySubscription?.subscriptionPrice?.billingPeriod ?? SubscriptionBillingPeriod.MONTHLY
  );
  const [currency] = useState("usd");

  useEffect(() => {
    if (actionData?.success) {
      successModal.current?.show(actionData?.success);
    }
    if (actionData?.error) {
      errorModal.current?.show(actionData?.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function cancel() {
    confirmModal.current?.show(t("settings.subscription.confirmCancel"));
  }
  function confirmCancel() {
    const form = new FormData();
    form.set("action", "cancel");
    submit(form, {
      method: "post",
    });
  }

  function toggleBillingPeriod() {
    if (billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
      setBillingPeriod(SubscriptionBillingPeriod.YEARLY);
    } else {
      setBillingPeriod(SubscriptionBillingPeriod.MONTHLY);
    }
  }
  function getYearlyDiscount(): string | undefined {
    const priceYearly = getPriceWithInterval(SubscriptionBillingPeriod.YEARLY);
    const priceMonthly = getPriceWithInterval(SubscriptionBillingPeriod.MONTHLY);
    if (priceYearly && priceMonthly) {
      const discount = 100 - (priceYearly.price * 100) / (priceMonthly.price * 12);
      if (discount !== 0) {
        return "-" + discount.toFixed(0) + "%";
      }
    }

    return undefined;
  }
  function getPriceWithInterval(billingPeriod: SubscriptionBillingPeriod): SubscriptionPrice | undefined {
    let price: SubscriptionPrice | undefined;
    if (data.items && data.items.length > 0) {
      data.items.forEach((product) => {
        const prices = product.prices.find((f) => f.billingPeriod === billingPeriod && f.currency === currency && f.price > 0);
        if (prices) {
          price = {
            id: prices.id ?? "",
            ...prices,
          };
        }
      });
    }
    return price;
  }

  return (
    <div className="py-4 space-y-6 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
      <div className="grid lg:grid-cols-2 gap-6 md:gap-2 mb-4">
        <div className="md:col-span-1">
          <div className="sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{t("settings.subscription.title")}</h3>

            <div className="mt-1 text-sm leading-5 text-gray-600">
              {(() => {
                if (appData.mySubscription) {
                  return (
                    <span>
                      <p className="text-xs text-gray-900 font-bold"></p>
                      <p>
                        <button onClick={cancel} className="text-gray-500 font-medium hover:underline hover:text-gray-600">
                          {t("settings.subscription.clickCancel")}
                        </button>
                      </p>
                    </span>
                  );
                } else {
                  return <span>{t("settings.subscription.description")}</span>;
                }
              })()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end space-x-4">
          <span className="text-base font-medium">{t("pricing.MONTHLY")}</span>
          <button className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" onClick={toggleBillingPeriod}>
            <div className="w-12 h-6 transition bg-teal-500 rounded-full shadow-md outline-none"></div>
            <div
              className={clsx(
                "absolute inline-flex bg-white items-center justify-center w-4 h-4 transition-all duration-200 ease-in-out transform rounded-full shadow-sm top-1 left-1",
                billingPeriod === 3 && "translate-x-0",
                billingPeriod === 4 && "translate-x-6"
              )}
            ></div>
          </button>
          <span className="text-base font-medium">
            {t("pricing.YEARLY")}{" "}
            {getYearlyDiscount() && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-teal-100 text-teal-800">
                {getYearlyDiscount()}
              </span>
            )}
          </span>
        </div>
      </div>

      {data.items.length === 0 ? (
        <>
          {appData.user.admin ? (
            <WarningBanner redirect="/admin/setup/pricing" title={t("shared.warning")} text={t("admin.pricing.noPricesInDatabase")} />
          ) : (
            <WarningBanner title={t("shared.warning")} text={t("admin.pricing.noPricesConfigured")} />
          )}
        </>
      ) : (
        <ChangeSubscription items={data.items} current={appData.mySubscription} billingPeriod={billingPeriod} currency={currency} />
      )}

      <MySubscriptionFeatures features={data.myFeatures} withCurrentPlan={false} />

      {data.myInvoices.length > 0 && (
        <>
          <div className="grid lg:grid-cols-2 gap-6 md:gap-2 mb-4">
            <div className="md:col-span-1">
              <div className="sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{t("app.subscription.invoices.title")}</h3>

                <div className="mt-1 text-sm leading-5 text-gray-600">{t("app.subscription.invoices.description")}</div>
              </div>
            </div>
          </div>

          <MyInvoices items={data.myInvoices} />
        </>
      )}

      <ConfirmModal ref={confirmModal} onYes={confirmCancel} />
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

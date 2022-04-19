import { useTranslation } from "react-i18next";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState } from "react";
import plans from "~/application/pricing/plans.server";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, Outlet, useActionData, useCatch, useLoaderData, useSubmit, useTransition } from "remix";
import { getAllSubscriptionProducts, getAllSubscriptionProductsWithTenants, getSubscriptionProduct } from "~/utils/db/subscriptionProducts.db.server";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { createPlans, syncPlan } from "~/utils/services/pricingService";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { createAdminUserEvent } from "~/utils/db/userEvents.db.server";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import clsx from "clsx";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { Tenant } from ".prisma/client";

type LoaderData = {
  title: string;
  isStripeTest: boolean;
  items: SubscriptionProductDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("admin.pricing.title")} | ${process.env.APP_NAME}`,
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
    items: await getAllSubscriptionProductsWithTenants(),
  };

  if (data.items.length === 0) {
    data.items = plans;
  }

  return json(data);
};

export type PricingPlansActionData = {
  error?: string;
  success?: string;
  items?: Awaited<ReturnType<typeof getAllSubscriptionProducts>>;
};
const badRequest = (data: PricingPlansActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const form = await request.formData();
  const type = form.get("type")?.toString();
  if (type === "create-all-plans") {
    const items = await getAllSubscriptionProducts();
    if (items.length > 0) {
      return json({
        items,
      });
    }

    plans.forEach((plan) => {
      plan.translatedTitle = t(plan.title);
    });

    try {
      await createPlans(plans);
      await createAdminUserEvent(request, "Created pricing plans", plans.map((f) => t(f.title)).join(", "));

      await new Promise((r) => setTimeout(r, 3000));

      return json({
        items: await getAllSubscriptionProducts(),
      });
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (type === "sync-plan-with-payment-provider") {
    const id = form.get("id")?.toString() ?? "";
    const item = await getSubscriptionProduct(id);
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      item.translatedTitle = t(item.title);
      await syncPlan(item, item.prices);
      return json({
        items: await getAllSubscriptionProducts(),
      });
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminPricingRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<PricingPlansActionData>();
  const { t } = useTranslation();
  const submit = useSubmit();
  const transition = useTransition();
  const loading = transition.state === "submitting";

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [items, setItems] = useState<SubscriptionProductDto[]>(data.items);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      successModal.current?.show(t("shared.success"), actionData.success);
    }
    setItems(actionData?.items ?? data.items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  useEffect(() => {
    setItems(data.items);
  }, [data]);

  const sortedItems = () => {
    return items.sort((x, y) => {
      return x?.tier > y?.tier ? 1 : -1;
    });
  };

  function createAllPlans() {
    const form = new FormData();
    form.set("type", "create-all-plans");
    submit(form, {
      method: "post",
    });
  }
  function syncPlanWithPaymentProvider(item: SubscriptionProductDto) {
    const form = new FormData();
    form.set("type", "sync-plan-with-payment-provider");
    form.set("id", item.id?.toString() ?? "");
    submit(form, {
      method: "post",
    });
  }
  // function createPlan(item: SubscriptionProductDto) {
  //   const form = new FormData();
  //   form.set("type", "create-plan");
  //   form.set("tier", item.tier);
  //   form.set("tier", item.description);
  //   employees.forEach((item) => {
  //     form.append("employees[]", JSON.stringify(item));
  //   });
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  function createdPlans() {
    return data.items.filter((f) => f.id).length;
  }

  function getTenantsSubscribed(item: SubscriptionProductDto): Tenant[] {
    const tenants: Tenant[] = [];
    item.prices.forEach((price) => {
      price.tenantSubscriptions?.forEach((subscription) => {
        tenants.push(subscription.tenant);
      });
    });
    return tenants;
  }

  return (
    <div>
      <Breadcrumb
        className="w-full"
        home="/admin/dashboard"
        menu={[
          { title: t("app.sidebar.setup"), routePath: "/admin/setup" },
          { title: t("admin.pricing.title"), routePath: "/admin/setup/pricing" },
        ]}
      />
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2 ">
          <h1 className="flex-1 font-bold flex items-center truncate">
            {t("admin.pricing.title")}
            <span className="ml-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-800 border border-gray-300">
              {sortedItems().length}
            </span>
          </h1>
          <Form method="post" className="flex items-center space-x-2 h-9">
            <ButtonSecondary disabled={loading} to="/pricing" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <div>{t("shared.preview")}</div>
            </ButtonSecondary>
            {/* <ButtonSecondary disabled={loading} to=".">
              {t("shared.reload")}
            </ButtonSecondary> */}

            <ButtonPrimary to="new" disabled={loading}>
              {t("shared.new")}
            </ButtonPrimary>
          </Form>
        </div>
      </div>

      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        {createdPlans() === 0 && (
          <WarningBanner title={t("shared.warning")} text={t("admin.pricing.thesePricesAreFromFiles")}>
            <button
              type="button"
              className={clsx("underline font-bold", loading || (createdPlans() > 0 && "cursor-not-allowed opacity-80"))}
              onClick={createAllPlans}
              disabled={loading || createdPlans() > 0}
            >
              {t("admin.pricing.generateFromFiles")}
            </button>
          </WarningBanner>
        )}
        <div className="flex flex-col">
          {(() => {
            if (items.length === 0) {
              return (
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("admin.pricing.noPricesConfigured"),
                  }}
                />
              );
            } else {
              return (
                <div className="overflow-x-auto">
                  <div className="py-2 align-middle inline-block min-w-full">
                    <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-1 py-2 bg-gray-50 text-center text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.tier")}
                            </th>
                            <th className="px-1 py-2 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.title")}
                            </th>
                            {/* <th className="px-1 py-2 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.badge")}
                            </th> */}
                            <th className="px-1 py-2 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.user.plural")} <span className=" text-xs italic text-gray-400 font-light">({t("shared.max")})</span>
                            </th>
                            <th className="px-1 py-2 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.contract.plural")} <span className=" text-xs italic text-gray-400 font-light">({t("shared.monthly")})</span>
                            </th>
                            <th className="px-1 py-2 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.plural")}
                            </th>
                            <th className="px-1 py-2 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.status")}
                            </th>
                            <th className="px-1 py-2 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.serviceId")}
                            </th>
                            <th className="px-1 py-2 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("shared.actions")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedItems().map((item, index) => {
                            return (
                              <tr key={index} className="text-gray-600">
                                <td className="truncate px-1 py-2 text-sm leading-3 text-center">{item.tier}</td>
                                <td className="truncate px-1 py-2 text-sm leading-3">
                                  {t(item.title)}{" "}
                                  {item.badge && (
                                    <span className=" ml-1 bg-theme-50 text-theme-800 border border-theme-200 px-1 py-0.5 rounded-md text-xs">
                                      {t(item.badge)}
                                    </span>
                                  )}
                                </td>
                                {/* <td className="truncate px-1 py-2 text-sm leading-3">{item.badge && <div>{t(item.badge)}</div>}</td> */}
                                <td className="truncate px-1 py-2 text-sm leading-3">
                                  {!item.maxUsers || item.maxUsers === 0 ? t("shared.unlimited") : item.maxUsers}
                                </td>
                                <td className="truncate px-1 py-2 text-sm leading-3">
                                  {!item.monthlyContracts || item.monthlyContracts === 0 ? t("shared.unlimited") : item.monthlyContracts}
                                </td>
                                <td className="truncate px-1 py-2 text-sm leading-3">
                                  <div
                                    title={getTenantsSubscribed(item)
                                      .map((f) => f.name)
                                      .join(", ")}
                                    className=" lowercase text-gray-400"
                                  >
                                    {getTenantsSubscribed(item).length} {t("shared.active")}
                                  </div>
                                </td>
                                <td className="truncate px-1 py-2 text-sm leading-3">
                                  {item.active ? (
                                    <>
                                      <span
                                        className={clsx(
                                          "inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium leading-1",
                                          item.public
                                            ? "bg-teal-50 text-teal-800 border border-teal-200"
                                            : "bg-orange-50 text-orange-800 border border-orange-200"
                                        )}
                                      >
                                        {item.public ? t("models.subscriptionProduct.public") : t("models.subscriptionProduct.custom")}
                                      </span>
                                    </>
                                  ) : (
                                    t("shared.inactive")
                                  )}
                                </td>
                                <td className="truncate px-1 py-2 text-sm leading-3 text-theme-700">
                                  {!item.stripeId ? (
                                    <>
                                      {!item.id ? (
                                        <div className=" text-gray-400">-</div>
                                      ) : (
                                        <ButtonTertiary disabled={loading} className="w-14 py-1" onClick={() => syncPlanWithPaymentProvider(item)}>
                                          {t("shared.sync")}
                                        </ButtonTertiary>
                                      )}
                                    </>
                                  ) : (
                                    <a
                                      target="_blank"
                                      className=" underline"
                                      rel="noreferrer"
                                      href={`https://dashboard.stripe.com${data.isStripeTest ? "/test" : ""}/products/${item.stripeId}`}
                                    >
                                      {item.stripeId}
                                    </a>
                                  )}
                                </td>
                                <td className="px-1 py-2 max-w-xs truncate whitespace-nowrap text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    {item.id ? (
                                      <>
                                        <ButtonTertiary className="w-14 py-1" to={"/admin/setup/pricing/edit/" + item.id}>
                                          {t("shared.edit")}
                                        </ButtonTertiary>
                                      </>
                                    ) : (
                                      <>
                                        <ButtonTertiary className="w-14 py-1" disabled={true}>
                                          {t("shared.edit")}
                                        </ButtonTertiary>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </div>
      <Outlet />
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div>Server Error: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <div>Client Error: {caught.status}</div>;
}

import { useTranslation } from "react-i18next";
import { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState } from "react";
import plans from "~/application/pricing/plans.server";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, useActionData, useLoaderData, useTransition } from "remix";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { createPlans } from "~/utils/services/pricingService";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { createAdminUserEvent } from "~/utils/db/users.db.server";

type LoaderData = {
  title: string;
  onStripe: boolean;
  isStripeTest: boolean;
  items: SubscriptionProductDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("admin.pricing.title")} | ${process.env.APP_NAME}`,
    onStripe: true,
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
    items: await getAllSubscriptionProducts(),
  };

  const items = await getAllSubscriptionProducts();
  if (items.length === 0) {
    data.onStripe = false;
    data.items = plans;
  }

  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  onStripe?: boolean;
  items?: Awaited<ReturnType<typeof getAllSubscriptionProducts>>;
};
const success = (data: ActionData) => json(data, { status: 200 });
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const items = await getAllSubscriptionProducts();
  if (items.length > 0) {
    return success({
      onStripe: true,
      items,
    });
  }

  plans.forEach((plan) => {
    plan.title = t(plan.title);
  });

  try {
    await createPlans(plans);
    await createAdminUserEvent(request, "Created pricing plans", plans.map((f) => t(f.title)).join(", "));

    await new Promise((r) => setTimeout(r, 3000));

    return success({
      onStripe: true,
      items: await getAllSubscriptionProducts(),
    });
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function AdminPricingRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
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

  const sortedItems = () => {
    return items.sort((x, y) => {
      return x?.tier > y?.tier ? 1 : -1;
    });
  };

  return (
    <div>
      <Breadcrumb
        className="w-full"
        home="/admin"
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
              {!data.onStripe ? <div>{t("shared.preview")}</div> : <div>{t("shared.view")}</div>}
            </ButtonSecondary>
            {/* <ButtonSecondary disabled={loading} to=".">
              {t("shared.reload")}
            </ButtonSecondary> */}
            <ButtonPrimary type="submit" disabled={loading || data.onStripe}>
              {t("admin.emails.createAll")}
            </ButtonPrimary>
          </Form>
        </div>
      </div>

      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
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
                            <th className="px-3 py-3 bg-gray-50 text-center text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.tier")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.title")}
                            </th>

                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.badge")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.status")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.workspaces")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.users")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.links")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.storage")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.monthlyContracts")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate text-center">
                              {t("models.subscriptionProduct.serviceId")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedItems().map((item, index) => {
                            return (
                              <tr key={index} className="text-gray-600">
                                <td className="truncate px-3 py-3 text-sm leading-3 text-center">{item.tier}</td>
                                <td className="truncate px-3 py-3 text-sm leading-3">{t(item.title)}</td>
                                <td className="truncate px-3 py-3 text-sm leading-3">{item.badge && <div>{t(item.badge)}</div>}</td>
                                {/*<td className="truncate px-3 py-3 text-sm leading-3">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium leading-1"
                        :className="item.active ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-rose-50 text-red-800 border border-red-200'"
                      >{ item.active ? t("shared.active") : t("shared.inactive") }</span>
                    </td>*/}
                                <td className="truncate px-3 py-3 text-sm leading-3">{item.active ? t("shared.active") : t("shared.inactive")}</td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.maxWorkspaces || item.maxWorkspaces === 0 ? t("shared.unlimited") : item.maxWorkspaces}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.maxUsers || item.maxUsers === 0 ? t("shared.unlimited") : item.maxUsers}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.maxLinks || item.maxLinks === 0 ? t("shared.unlimited") : item.maxLinks}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.maxStorage || item.maxStorage === 0 ? t("shared.unlimited") : item.maxStorage / 1024}
                                  {item.maxStorage > 0 && <span>{t("shared.storage.gb")}</span>}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.monthlyContracts || item.maxLinks === 0 ? t("shared.unlimited") : item.monthlyContracts}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3 text-theme-700">
                                  {!item.stripeId ? (
                                    <div className=" text-gray-400 text-center">-</div>
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
    </div>
  );
}

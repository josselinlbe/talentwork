import { useTranslation } from "react-i18next";
import { Tenant } from ".prisma/client";
import { TenantSubscriptionWithDetails } from "~/utils/db/tenantSubscriptions.db.server";
import clsx from "clsx";
import { FormEvent, useEffect, useRef, useState } from "react";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useSubmit, useTransition } from "remix";
import InputSelect from "~/components/ui/input/InputSelect";
import { SubscriptionPriceWithProduct } from "~/utils/db/subscriptionProducts.db.server";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

interface Props {
  tenant: Tenant;
  subscription: TenantSubscriptionWithDetails | null;
  subscriptionPrices: SubscriptionPriceWithProduct[];
}

export default function UpdateTenantSubscriptionForm({ tenant, subscription, subscriptionPrices }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const transition = useTransition();
  const loading = transition.state === "submitting";

  const confirmSave = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  const [subscriptionPriceId, setSubscriptionPriceId] = useState(subscription?.subscriptionPriceId ?? undefined);

  const subscriptionPricesOptions = subscriptionPrices.map((item) => {
    return {
      value: item.id,
      name: getPriceDescription(item),
    };
  });
  function getPriceDescription(item: SubscriptionPriceWithProduct) {
    return t(item.subscriptionProduct.title) + " - $" + item.price + "/" + billingPeriodName(item.billingPeriod);
  }
  function billingPeriodName(billingPeriod: SubscriptionBillingPeriod): string {
    return t("pricing." + SubscriptionBillingPeriod[billingPeriod].toString()).toString();
  }

  const [, setMaxUsers] = useState(0);
  const [, setMonthlyContracts] = useState(0);

  useEffect(() => {
    loadSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadSubscription() {
    setMaxUsers(subscription?.maxUsers ?? 0);
    setMonthlyContracts(subscription?.monthlyContracts ?? 0);
  }

  function save(e: FormEvent) {
    const previousPrice = subscriptionPrices.find((f) => f.id === subscription?.subscriptionPriceId);
    const price = subscriptionPrices.find((f) => f.id === subscriptionPriceId);
    if (!price) {
      errorModal.current?.show("Select a valid plan");
      return;
    }
    e.preventDefault();
    if (thereAreNoChanges()) {
      errorModal.current?.show(t("shared.error"), t("shared.noChanges"));
    } else {
      if (previousPrice) {
        confirmSave.current?.show(
          "Manually update subscription",
          t("shared.yes"),
          t("shared.cancel"),
          `Update ${tenant.name} subscription, from ${getPriceDescription(previousPrice)} to ${getPriceDescription(price)}`
        );
      } else {
        confirmSave.current?.show(
          "Manually update subscription",
          t("shared.yes"),
          t("shared.cancel"),
          `Update ${tenant.name} subscription to ${getPriceDescription(price)}`
        );
      }
    }
  }
  const thereAreNoChanges = () => {
    return subscriptionPriceId === subscription?.subscriptionPriceId;
  };
  function saveConfirm() {
    const form = new FormData();
    form.set("type", "update-tenant-subscription");
    form.set("subscription-price-id", subscriptionPriceId?.toString() ?? "");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      <div className="lg:grid lg:grid-cols-1 lg:gap-6">
        <div className="mt-5 lg:mt-0 lg:col-span-2">
          <form onSubmit={save} method="POST">
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12">
                    <InputSelect
                      name="subscription-price-id"
                      title="Subscription"
                      value={subscriptionPriceId}
                      options={subscriptionPricesOptions}
                      onChange={(e) => setSubscriptionPriceId(e.target.value)}
                    />
                  </div>

                  {/* <div className="col-span-6 lg:col-span-3">
                    <label htmlFor="stripe-customer-id" className="block text-sm font-medium text-gray-700">
                      Stripe customer ID
                    </label>
                    <input
                      type="text"
                      name="stripe-customer-id"
                      id="stripe-customer-id"
                      value={subscription?.stripeCustomerId ?? ""}
                      readOnly={true}
                      required
                      disabled={true}
                      className={clsx(
                        "bg-gray-100 mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      )}
                    />
                  </div>

                  <div className="col-span-6 lg:col-span-3">
                    <label htmlFor="stripe-subscription-id" className="block text-sm font-medium text-gray-700">
                      Subscription ID
                    </label>
                    <input
                      type="text"
                      name="stripe-subscription-id"
                      id="stripe-subscription-id"
                      value={subscription?.stripeSubscriptionId ?? ""}
                      readOnly={true}
                      required
                      disabled={true}
                      className={clsx(
                        "bg-gray-100 mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      )}
                    />
                  </div>

                  <div className="col-span-6 lg:col-span-3">
                    <label htmlFor="max-users" className="block text-sm font-medium text-gray-700">
                      Max users
                    </label>
                    <input
                      ref={inputMaxUsers}
                      type="number"
                      min={0}
                      name="max-users"
                      id="max-users"
                      autoComplete="max-users"
                      value={maxUsers}
                      onChange={(e) => setMaxUsers(Number(e.target.value))}
                      disabled
                      className={"bg-gray-100 mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"}
                    />
                  </div>

                  <div className="col-span-6 lg:col-span-3">
                    <label htmlFor="monthly-contracts" className="block text-sm font-medium text-gray-700">
                      Monthly contracts
                    </label>
                    <input
                      type="number"
                      min={0}
                      name="monthly-contracts"
                      id="monthly-contracts"
                      autoComplete="monthly-contracts"
                      value={monthlyContracts}
                      onChange={(e) => setMonthlyContracts(Number(e.target.value))}
                      disabled
                      className={"bg-gray-100 mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"}
                    />
                  </div> */}
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end">
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={thereAreNoChanges() || loading}
                    className={clsx(
                      "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                      thereAreNoChanges() && " opacity-50 cursor-not-allowed",
                      loading && " opacity-80 cursor-not-allowed"
                    )}
                  >
                    {t("shared.save")}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmSave} onYes={saveConfirm} />
    </div>
  );
}

import { useTranslation } from "react-i18next";
import DateUtils from "~/utils/shared/DateUtils";
import { SubscriptionPrice, Tenant } from ".prisma/client";
import { SubscriptionProduct } from "@prisma/client";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import EmptyState from "~/components/ui/emptyState/EmptyState";

interface Props {
  tenant: Tenant;
  subscriptionPrice: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null;
}

export default function TenantSubscription({ tenant, subscriptionPrice }: Props) {
  const { t } = useTranslation();

  const headers = [
    {
      title: t("app.tenants.subscription.plan"),
    },
    {
      title: t("app.tenants.subscription.price"),
    },
    {
      title: t("app.tenants.subscription.workspaces"),
    },
    {
      title: t("app.tenants.subscription.members"),
    },
    {
      title: t("app.tenants.subscription.links"),
    },
    {
      title: t("models.contract.plural"),
    },
    {
      title: t("app.tenants.subscription.storage"),
    },
  ];

  function priceBillingPeriod(price: SubscriptionPrice): string {
    if (price.billingPeriod === SubscriptionBillingPeriod.ONCE) {
      return t("pricing.once").toString();
    } else {
      return "/" + t("pricing." + SubscriptionBillingPeriod[price.billingPeriod] + "Short");
    }
  }
  function dateAgo(value: Date) {
    return DateUtils.dateAgo(value);
  }
  function dateYMD(value: Date | undefined) {
    return DateUtils.dateYMD(value);
  }

  return (
    <div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <div className="py-2 align-middle inline-block min-w-full">
                {!subscriptionPrice ? (
                  <EmptyState
                    className="bg-white"
                    captions={{
                      thereAreNo: t("api.errors.noSubscription"),
                    }}
                  />
                ) : (
                  <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {headers.map((header, idx) => {
                            return (
                              <th key={idx} scope="col" className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <div>{header.title}</div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {subscriptionPrice && subscriptionPrice.subscriptionProduct && <span>{t(subscriptionPrice.subscriptionProduct.title)}</span>}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {subscriptionPrice && (
                              <span>
                                {subscriptionPrice.price}
                                {priceBillingPeriod(subscriptionPrice)}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{subscriptionPrice?.subscriptionProduct.maxWorkspaces}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{subscriptionPrice?.subscriptionProduct.maxUsers}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{subscriptionPrice?.subscriptionProduct.maxLinks}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{subscriptionPrice?.subscriptionProduct.monthlyContracts}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {subscriptionPrice?.subscriptionProduct?.maxStorage ?? 0 / 1024}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

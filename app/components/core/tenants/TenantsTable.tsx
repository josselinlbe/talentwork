import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import type { TenantWithDetails } from "~/utils/db/tenants.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: TenantWithDetails[];
  withSearch: boolean;
}
export default function TenantsTable({ items, withSearch = true }: Props) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");
  const headers = [
    {
      title: t("models.tenant.object"),
    },
    {
      title: t("shared.slug"),
    },
    {
      title: t("admin.tenants.subscription.title"),
    },
    {
      title: t("models.user.plural"),
    },
    {
      title: t("models.contract.plural"),
    },
    {
      title: t("models.employee.plural"),
    },
    {
      title: t("shared.createdAt"),
    },
    {
      title: "", // actions
    },
  ];

  const orderedItems = () => {
    if (!filteredItems()) {
      return [];
    }
    return filteredItems()
      .slice()
      .sort((x, y) => {
        if (x.createdAt && y.createdAt) {
          return (x.createdAt > y.createdAt ? -1 : 1) ?? -1;
        }
        return -1;
      });
  };
  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter((f) => f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()));
  };
  function billingPeriodName(item: TenantWithDetails) {
    return t("pricing." + SubscriptionBillingPeriod[item.subscription?.subscriptionPrice?.billingPeriod ?? SubscriptionBillingPeriod.MONTHLY] + "Short");
  }

  return (
    <div className="space-y-2">
      {withSearch && (
        <div className="flex justify-between">
          <div className="flex items-center justify-start w-full">
            <div className="relative flex items-center w-full">
              <div className="focus-within:z-10 absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="buscador"
                id="buscador"
                className="w-full focus:ring-theme-500 focus:border-theme-500 block rounded-md pl-10 sm:text-sm border-gray-300"
                placeholder={t("shared.searchDot")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      {(() => {
        if (orderedItems().length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                captions={{
                  thereAreNo: t("app.tenants.empty"),
                }}
              />
            </div>
          );
        } else {
          return (
            <div>
              <div>
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <div className="py-2 align-middle inline-block min-w-full">
                      <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {headers.map((header, idx) => {
                                return (
                                  <th
                                    key={idx}
                                    scope="col"
                                    className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate"
                                  >
                                    <div className="flex items-center space-x-1 text-gray-500">
                                      <div>{header.title}</div>
                                    </div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orderedItems().map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.name}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <Link to={`/app/${item.slug}`} className="underline text-gray-800">
                                      {item.slug}
                                    </Link>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex space-x-1">
                                      <span>
                                        {item.subscription?.subscriptionPrice?.subscriptionProduct ? (
                                          <>
                                            {t(item.subscription?.subscriptionPrice?.subscriptionProduct?.title)}
                                            {" - "}
                                            <span className=" ">
                                              ({item.subscription?.subscriptionPrice?.price ?? "-"}/{billingPeriodName(item)})
                                            </span>
                                          </>
                                        ) : (
                                          <span className="italic text-gray-500">{t("settings.subscription.noSubscription")}</span>
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {item.usersCount}
                                    <span className=" text-gray-400">/{item.subscription?.subscriptionPrice?.subscriptionProduct?.maxUsers ?? "-"}</span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {item.contractsCount}
                                    <span className=" text-gray-400">
                                      /{item.subscription?.subscriptionPrice?.subscriptionProduct?.monthlyContracts ?? "-"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.employeesCount === 0 ? "-" : item.employeesCount}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
                                      {DateUtils.dateAgo(item.createdAt)}
                                    </time>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                      <ButtonTertiary to={`/admin/tenants/${item.id}`}>{t("admin.tenants.overview")}</ButtonTertiary>
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
                </div>
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}

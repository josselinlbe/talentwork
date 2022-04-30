import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import type { TenantWithDetails } from "~/utils/db/tenants.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import type { CellValue, Column } from "react-table";
import { useSortBy, useTable } from "react-table";
import React from "react";
import DownArrow from "~/components/icons/DownArrow";
import UpArrow from "~/components/icons/UpArrow";

interface Props {
  items: TenantWithDetails[];
  withSearch: boolean;
}
export default function TenantsTableWithReactTable({ items, withSearch = true }: Props) {
  const { t } = useTranslation();

  function billingPeriodName(item: TenantWithDetails) {
    return t("pricing." + SubscriptionBillingPeriod[item.subscription?.subscriptionPrice?.billingPeriod ?? SubscriptionBillingPeriod.MONTHLY] + "Short");
  }

  const columns = React.useMemo(
    () => [
      {
        Header: t("models.tenant.object"),
        accessor: "name", // accessor is the "key" in the data
      },
      {
        Header: t("shared.slug"),
        accessor: (row: TenantWithDetails): CellValue<ReactNode> => {
          return (
            <Link to={`/app/${row.slug}`} className="underline text-gray-800">
              {row.slug}
            </Link>
          );
        },
      },
      {
        Header: t("admin.tenants.subscription.title"),
        accessor: (row: TenantWithDetails): CellValue<ReactNode> => {
          if (row.subscription?.subscriptionPrice) {
            return (
              <>
                {t(row.subscription?.subscriptionPrice?.subscriptionProduct?.title)}
                {" - "}
                <span className=" ">
                  ({row.subscription?.subscriptionPrice?.price ?? "-"}/{billingPeriodName(row)})
                </span>
              </>
            );
          } else {
            return <div className="italic text-gray-500">{t("settings.subscription.noSubscription")}</div>;
          }
        },
      },
      {
        Header: t("models.user.plural"),
        accessor: "usersCount",
      },
      {
        Header: t("models.contract.plural"),
        accessor: "contractsCount",
      },
      {
        Header: t("models.employee.plural"),
        accessor: "employeesCount",
      },
      {
        Header: t("shared.createdAt"),
        accessor: (row: TenantWithDetails): CellValue<ReactNode> => {
          return (
            <time dateTime={DateUtils.dateYMDHMS(row.createdAt)} title={DateUtils.dateYMDHMS(row.createdAt)}>
              {DateUtils.dateAgo(row.createdAt)}
            </time>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => items, []);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data }, useSortBy);

  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
              <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {headerGroups.map((headerGroup, idxHeaderGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={idxHeaderGroup}>
                      {headerGroup.headers.map((column, idxColumn) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          key={idxColumn}
                          className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate"
                        >
                          <div className="flex items-center space-x-1 text-gray-500">
                            <span>{column.render("Header")}</span>
                            <span>{column.isSorted ? column.isSortedDesc ? <DownArrow /> : <UpArrow /> : ""}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                  {rows.map((row, idxRow) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} key={idxRow}>
                        {row.cells.map((cell, idxCell) => {
                          return (
                            <td {...cell.getCellProps()} key={idxCell} className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
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
  );
}

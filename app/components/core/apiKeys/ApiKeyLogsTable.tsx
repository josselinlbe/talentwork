import { useTranslation } from "react-i18next";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import DateUtils from "~/utils/shared/DateUtils";
import { useEffect, useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import { ApiKeyLogWithDetails } from "~/utils/db/apiKeys.db.server";
import InputSearch from "~/components/ui/input/InputSearch";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";

interface Props {
  items: ApiKeyLogWithDetails[];
  withTenant: boolean;
}

type Header = {
  title: string;
  name?: string;
  sortable?: boolean;
};

export default function ApiKeyLogsTable({ withTenant, items }: Props) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        DateUtils.dateYMDHMS(f.createdAt)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.apiKey?.tenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.method?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.endpoint?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.params?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.error?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  const [sortByColumn, setSortByColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState(1);

  const [headers, setHeaders] = useState<Header[]>([]);

  useEffect(() => {
    let headers: Header[] = [];
    headers.push({
      name: "createdAt",
      title: t("shared.createdAt"),
      sortable: true,
    });
    if (withTenant) {
      headers.push({
        title: t("models.tenant.object"),
      });
    }
    headers.push({
      name: "alias",
      title: t("models.apiKey.alias"),
    });
    headers.push({
      name: "ip",
      title: t("models.apiKeyLog.ip"),
    });
    headers.push({
      name: "endpoint",
      title: t("models.apiKeyLog.endpoint"),
    });
    headers = [
      ...headers,
      {
        name: "method",
        title: t("models.apiKeyLog.method"),
      },
      {
        name: "status",
        title: t("models.apiKeyLog.status"),
      },
      // {
      //   name: "params",
      //   title: t("models.apiKeyLog.params"),
      // },
      {
        name: "error",
        title: t("shared.error"),
      },
    ];
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTenant]);

  function sortBy(column: string | undefined) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }

  const sortedItems = () => {
    if (!filteredItems()) {
      return [];
    }
    const column = sortByColumn;
    if (!column) {
      return filteredItems();
    }
    return filteredItems()
      .slice()
      .sort((x, y) => {
        if (x[column] && y[column]) {
          if (sortDirection === -1) {
            return (x[column] > y[column] ? 1 : -1) ?? 1;
          } else {
            return (x[column] < y[column] ? 1 : -1) ?? 1;
          }
        }
        return 1;
      });
  };

  function getMethodColor(item: ApiKeyLogWithDetails) {
    if (item.method === "POST") {
      return Colors.GREEN;
    } else if (item.method === "GET") {
      return Colors.BLUE;
    } else if (item.method === "PUT") {
      return Colors.ORANGE;
    } else if (item.method === "DELETE") {
      return Colors.RED;
    }
    return Colors.GRAY;
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <div>
        {(() => {
          if (sortedItems().length === 0) {
            return (
              <div>
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("shared.noRecords"),
                  }}
                  icon="plus"
                />
              </div>
            );
          } else {
            return (
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
                                  onClick={() => sortBy(header.name)}
                                  scope="col"
                                  className={clsx(
                                    "px-2 py-2 text-left text-xs font-medium text-gray-500 tracking-wider select-none",
                                    header.name && "cursor-pointer hover:text-gray-700"
                                  )}
                                >
                                  <div className="flex items-center space-x-1 text-gray-500">
                                    <div>{header.title}</div>
                                    <div className={clsx((!header.name || sortByColumn !== header.name) && "invisible")}>
                                      {(() => {
                                        if (sortDirection === -1) {
                                          return (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path
                                                fillRule="evenodd"
                                                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          );
                                        } else {
                                          return (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          );
                                        }
                                      })()}
                                    </div>
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        {sortedItems().map((item, idx) => {
                          return (
                            <tbody key={idx} className="bg-white divide-y divide-gray-200">
                              <tr className="text-sm text-gray-600">
                                <td className="px-2 py-2 whitespace-nowrap">
                                  <div className="text-xs text-gray-600">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>
                                </td>
                                {withTenant && (
                                  <td className="px-2 py-2 whitespace-nowrap">{item.apiKey?.tenant?.name ?? <span className="text-gray-300">?</span>}</td>
                                )}
                                <td className="px-2 py-2 whitespace-nowrap">{item.apiKey ? item.apiKey?.alias : <span className="text-gray-300">?</span>}</td>
                                <td className="px-2 py-2 whitespace-nowrap">{item.ip.length > 0 ? item.ip : <span className="text-gray-300">?</span>}</td>
                                <td className="px-2 py-2 whitespace-nowrap">{item.endpoint}</td>
                                <td className="px-2 py-2 whitespace-nowrap">
                                  <SimpleBadge title={item.method} color={getMethodColor(item)} />
                                </td>

                                <td className="px-2 py-2 whitespace-nowrap">
                                  {item.status ? (
                                    <span>
                                      <SimpleBadge title={item.status.toString()} color={item.status.toString().startsWith("4") ? Colors.RED : Colors.GREEN} />
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">?</span>
                                  )}
                                </td>
                                {/* <td className="px-2 py-2 whitespace-nowrap">{item.params}</td> */}
                                {/* <td className="px-2 py-2 whitespace-nowrap">{item.body}</td> */}
                                <td className="px-2 py-2 whitespace-nowrap">{item.error}</td>
                              </tr>
                            </tbody>
                          );
                        })}
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
}

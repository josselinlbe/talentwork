import { useTranslation } from "react-i18next";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import DateUtils from "~/utils/shared/DateUtils";
import { useEffect, useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import { UserEventWithDetails } from "~/utils/db/users.db.server";

interface Props {
  items: UserEventWithDetails[];
  withTenant: boolean;
  withWorkspace: boolean;
}

type Header = {
  title: string;
  name?: string;
  sortable?: boolean;
};

export default function UserEventsTable({ withTenant, withWorkspace, items }: Props) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        DateUtils.dateYMDHMS(f.createdAt)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.action?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.details?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.tenant?.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.workspace?.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user?.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        (f.user?.firstName?.toString() + " " + f.user?.lastName?.toString()).toUpperCase().includes(searchInput.toUpperCase())
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
    if (withWorkspace) {
      headers.push({
        title: t("models.workspace.object"),
      });
    }
    headers = [
      ...headers,
      {
        title: t("models.user.object"),
      },
      {
        name: "action",
        title: t("models.userEvent.action"),
      },
      {
        name: "details",
        title: t("models.userEvent.details"),
      },
    ];
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTenant, withWorkspace]);

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

  return (
    <div className="space-y-2">
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
              autoComplete="off"
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div>
        {(() => {
          if (sortedItems().length === 0) {
            return (
              <div>
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("app.users.events.empty"),
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
                                {withTenant && <td className="px-2 py-2 whitespace-nowrap">{item.tenant?.name ?? "-"}</td>}
                                {withWorkspace && <td className="px-2 py-2 whitespace-nowrap">{item.workspace?.name ?? "-"}</td>}
                                <td className="px-2 py-2 whitespace-nowrap text-gray-700 text-sm">
                                  {item.user.firstName} {item.user.lastName} <span className=" text-gray-500 text-xs">({item.user.email})</span>
                                </td>

                                <td className="px-2 py-2 whitespace-nowrap">{item.action}</td>
                                <td className="px-2 py-2 whitespace-nowrap">{item.details}</td>
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

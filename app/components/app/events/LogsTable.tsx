import { useTranslation } from "react-i18next";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import DateUtils from "~/utils/shared/DateUtils";
import { useEffect, useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import { LogWithDetails } from "~/utils/db/logs.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import TablePagination from "~/components/ui/tables/TablePagination";

interface Props {
  items: LogWithDetails[];
  withTenant: boolean;
  pagination: PaginationDto;
}

type Header = {
  title: string;
  name?: string;
  sortable?: boolean;
};

export default function LogsTable({ withTenant, items, pagination }: Props) {
  const { t } = useTranslation();

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
    headers = [
      ...headers,
      {
        title: t("shared.createdBy"),
      },
      {
        name: "action",
        title: t("models.log.action"),
      },
      {
        name: "url",
        title: t("models.log.url"),
      },
      {
        name: "details",
        title: t("models.log.details"),
      },
    ];
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTenant]);

  return (
    <div className="space-y-2">
      <div>
        {(() => {
          if (items.length === 0) {
            return (
              <div>
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("app.users.logs.empty"),
                  }}
                  icon="plus"
                />
              </div>
            );
          } else {
            return (
              <div className="flex flex-col shadow border border-gray-200 sm:rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="py-2 align-middle inline-block min-w-full">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {headers.map((header, idx) => {
                              return (
                                <th key={idx} scope="col" className={clsx("px-2 py-2 text-left text-xs font-medium text-gray-500 tracking-wider select-none")}>
                                  <div className="flex items-center space-x-1 text-gray-500">
                                    <div>{header.title}</div>
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        {items.map((item, idx) => {
                          return (
                            <tbody key={idx} className="bg-white divide-y divide-gray-200">
                              <tr className="text-sm text-gray-600">
                                <td className="px-2 py-2 whitespace-nowrap">
                                  <div className="text-xs text-gray-600">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>
                                </td>
                                {withTenant && <td className="px-2 py-2 whitespace-nowrap">{item.tenant?.name ?? "-"}</td>}
                                <td className="px-2 py-2 whitespace-nowrap text-gray-700 text-sm">
                                  {item.user && (
                                    <span>
                                      {item.user.firstName} {item.user.lastName} <span className=" text-gray-500 text-xs">({item.user.email})</span>
                                    </span>
                                  )}
                                  {item.apiKey && (
                                    <span>
                                      API Key <span className=" text-gray-500 text-xs">({item.apiKey.alias})</span>
                                    </span>
                                  )}
                                </td>

                                <td className="px-2 py-2 whitespace-nowrap">{item.action}</td>
                                <td className="px-2 py-2 whitespace-nowrap">{item.url}</td>
                                <td className="px-2 py-2 whitespace-nowrap">{item.details}</td>
                              </tr>
                            </tbody>
                          );
                        })}
                      </table>
                    </div>
                  </div>
                </div>
                <TablePagination totalItems={pagination.totalItems} totalPages={pagination.totalPages} page={pagination.page} pageSize={pagination.pageSize} />
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
}

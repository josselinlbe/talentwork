import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import DateUtils from "~/utils/shared/DateUtils";
import { useEffect, useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useParams } from "remix";
import { Property } from "@prisma/client";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import TableSimple, { Header } from "~/components/ui/tables/TableSimple";

interface Props {
  entity: EntityWithDetails;
  items: RowWithDetails[];
  className?: string;
  withFolio?: boolean;
  withTenant?: boolean;
}

// type Header = {
//   name?: string;
//   title: string;
// };

export default function RowsListAndTable({ entity, items, withTenant = false, withFolio = true, className = "" }: Props) {
  const params = useParams();
  const { t } = useTranslation();

  const [sortByColumn, setSortByColumn] = useState<Property>();
  const [sortDirection, setSortDirection] = useState(-1);
  const [headers, setHeaders] = useState<Header<RowWithDetails>[]>([]);

  useEffect(() => {
    const headers: Header<RowWithDetails>[] = [];
    if (withTenant) {
      headers.push({
        name: "tenant",
        title: t("models.tenant.object"),
        value: (item) => item.tenant.name,
        href: (item) => item.tenant.id,
        breakpoint: "sm",
      });
    }
    if (withFolio) {
      headers.push({
        name: "folio",
        title: t("models.row.folio"),
        value: (item) => RowHelper.getRowFolio(entity, item),
        href: (item) => `/app/${item.tenant.slug}/${entity.slug}/${item.id}`,
        breakpoint: "sm",
        sortable: true,
      });
    }
    entity.properties
      .filter((f) => !f.isHidden && !f.isDetail)
      .forEach((property) => {
        headers.push({
          name: property.name,
          title: t(property.title),
          value: (item) => RowHelper.getCellValue(entity, item, property),
          href:
            property.type === PropertyType.ENTITY
              ? (item) =>
                  `/app/${item.tenant.slug}/${RowHelper.getPropertyValue(entity, item, property).entity.slug}/${
                    RowHelper.getPropertyValue(entity, item, property).id
                  }`
              : undefined,
        });
      });
    if (entity.properties.find((f) => f.isDetail)) {
      headers.push({ name: "rows", title: t("shared.rows"), value: (item) => item.details.length, breakpoint: "lg" });
    }
    headers.push({
      name: "createdAt",
      title: t("shared.createdAt"),
      value: (item) => DateUtils.dateAgo(item.createdAt),
      className: "text-gray-400 text-xs",
      breakpoint: "sm",
      sortable: true,
    });
    headers.push({
      name: "createdByUser",
      title: t("shared.createdBy"),
      value: (item) => item.createdByUser?.email ?? (item.createdByApiKey ? "API" : "?"),
      className: "text-gray-400 text-xs",
      breakpoint: "sm",
    });

    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, withTenant]);

  function sortBy(column?: string) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(entity.properties.find((f) => f.name === column));
    }
  }
  const sortedItems = () => {
    if (!items) {
      return [];
    }
    // const column = entity.properties.find((f) => f.name === sortByColumn);
    if (!sortByColumn) {
      return items;
    }
    return items.slice().sort((x, y) => {
      const xValue = RowHelper.getPropertyValue(entity, x, sortByColumn);
      const yValue = RowHelper.getPropertyValue(entity, y, sortByColumn);
      if (xValue && yValue) {
        return (xValue > yValue ? sortDirection * -1 : sortDirection) ?? sortDirection * -1;
      }
      return sortDirection * -1;
    });
  };

  function getEditRoute(item: RowWithDetails) {
    if (item.tenant) {
      return `/app/${item.tenant.slug}/${entity.slug}/${item.id}`;
    } else {
      return `${item.id}`;
    }
  }

  return (
    <div className={className}>
      <div>
        <TableSimple
          headers={headers}
          items={items}
          actions={[
            {
              title: t("shared.edit"),
              onClickRoute: (_, item) => getEditRoute(item),
            },
          ]}
          updatesUrl={!withTenant}
        />

        {false && (
          <>
            <div className="sm:hidden">
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {sortedItems().map((item, idx) => {
                    return (
                      <li key={idx}>
                        <Link to={UrlUtils.currentTenantUrl(params, `${params.slug}/${item.id}`)} className="block hover:bg-gray-50">
                          <div className="flex items-center px-2 py-1 sm:px-4">
                            <div className="min-w-0 flex-1 flex items-center">
                              <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                <div>
                                  <div className="mt-2 flex items-center justify-between text-gray-500 space-x-1">
                                    <div className="truncate">{DateUtils.dateMonthName(item.createdAt)}</div>
                                  </div>
                                </div>
                                <div className="hidden md:block">
                                  <div>
                                    <p className="text-sm text-gray-900">{item.createdAt && <time>{DateUtils.dateMonthName(item.createdAt)}</time>}</p>
                                    <p className="mt-2 flex items-center text-sm text-gray-500">
                                      {/*Heroicon name: solid/check-circle */}
                                      <svg
                                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              {/*Heroicon name: solid/chevron-right */}
                              <svg
                                className="h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="hidden sm:block">
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
                                    "text-xs px-2 py-1 text-left font-medium text-gray-500 tracking-wider select-none truncate",
                                    header.name && "cursor-pointer hover:text-gray-700"
                                  )}
                                >
                                  <div className="flex items-center space-x-1 text-gray-500">
                                    <div>{header.title}</div>
                                    <div className={clsx((!header.name || sortByColumn?.name !== header.name) && "invisible")}>
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
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedItems().map((item, idx) => {
                            return (
                              <tr key={idx}>
                                {withTenant && (
                                  <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                    <Link className="hover:underline" to={`/app/${item.tenant.slug}`}>
                                      {item.tenant.name}
                                    </Link>
                                  </td>
                                )}
                                {withFolio && (
                                  <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                    <Link
                                      to={`/app/${item.tenant.slug}/${entity.slug}/${item.id}`}
                                      className="uppercase p-2 hover:bg-gray-50 border border-transparent hover:border-gray-300 rounded-md focus:bg-gray-100"
                                    >
                                      {RowHelper.getRowFolio(entity, item)}
                                    </Link>
                                  </td>
                                )}
                                {entity.properties
                                  .filter((f) => !f.isHidden && !f.isDetail)
                                  .map((property) => {
                                    return (
                                      <td key={property.name} className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                        {property.type === PropertyType.ENTITY ? (
                                          <Link
                                            to={`/app/${item.tenant.slug}/${RowHelper.getPropertyValue(entity, item, property).entity.slug}/${
                                              RowHelper.getPropertyValue(entity, item, property).id
                                            }`}
                                            className="p-2 hover:bg-gray-50 border border-transparent hover:border-gray-300 rounded-md focus:bg-gray-100"
                                          >
                                            <span>{RowHelper.getCellValue(entity, item, property)}</span>
                                          </Link>
                                        ) : (
                                          <span>{RowHelper.getCellValue(entity, item, property)}</span>
                                        )}
                                        {/* {JSON.stringify(item)} */}
                                      </td>
                                    );
                                  })}
                                {entity.properties.filter((f) => f.isDetail).length > 0 && (
                                  <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">{item.details.length}</td>
                                )}
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                  <div className="text-gray-400 text-xs">{DateUtils.dateAgo(item.createdAt)}</div>
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                  <div className="flex flex-col">
                                    <div>
                                      {/* {item.createdByUser.firstName} {item.createdByUser.lastName}{" "} */}
                                      <span className="text-gray-400 text-xs">{item.createdByUser?.email ?? (item.createdByApiKey ? "API" : "?")}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="w-20 px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    <ButtonTertiary to={getEditRoute(item)}>{t("shared.edit")}</ButtonTertiary>
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
          </>
        )}
      </div>
    </div>
  );
}

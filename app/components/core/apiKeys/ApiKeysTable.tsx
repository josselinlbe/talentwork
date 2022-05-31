import { Entity } from "@prisma/client";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import InputSearch from "~/components/ui/input/InputSearch";
import { ApiKeyWithDetails } from "~/utils/db/apiKeys.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  entities: Entity[];
  items: ApiKeyWithDetails[];
  withTenant?: boolean;
}
type Header = {
  name?: string;
  title: string;
};
export default function ApiKeysTable({ entities, items, withTenant }: Props) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");
  const [headers, setHeaders] = useState<Header[]>([]);

  useEffect(() => {
    const headers: Header[] = [];
    if (withTenant) {
      headers.push({ name: "tenant", title: t("models.tenant.object") });
    }
    headers.push({ name: "key", title: t("models.apiKey.key") });
    headers.push({ name: "alias", title: t("models.apiKey.alias") });
    headers.push({ name: "usage", title: t("models.apiKey.usage") });
    entities.forEach((entity) => {
      headers.push({ name: "entityId", title: t(entity.titlePlural) });
    });
    headers.push({ name: "expires", title: t("models.apiKey.expires") });
    headers.push({ name: "createdAt", title: t("shared.createdAt") });
    headers.push({ name: "createdByUser", title: t("shared.createdBy") });
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTenant]);

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    const filtered = items.filter((f) => f.tenant.name?.toString()?.toUpperCase().includes(searchInput.toUpperCase()));

    return filtered.sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return (x.createdAt > y.createdAt ? -1 : 1) ?? -1;
      }
      return -1;
    });
  };

  // function deleteApiKey(item: ApiKey) {
  //   if (confirmDelete.current) {
  //     confirmDelete.current.setValue(item);
  //     confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  //   }
  // }
  // function confirmDeleteApiKey(item: ApiKey) {
  //   const form = new FormData();
  //   form.set("action", "delete");
  //   form.set("id", item.id);
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  function getEntityPermissions(item: ApiKeyWithDetails, entity: Entity, permission: string) {
    const apiKeyEntity = item.entities.find((f) => f.entityId === entity.id);
    if (apiKeyEntity) {
      if (permission === "C") {
        return apiKeyEntity.create;
      }
      if (permission === "R") {
        return apiKeyEntity.read;
      }
      if (permission === "U") {
        return apiKeyEntity.update;
      }
      if (permission === "D") {
        return apiKeyEntity.delete;
      }
    }
    return false;
  }

  function hasExpired(item: ApiKeyWithDetails) {
    const now = new Date();
    return item.expires && item.expires < now;
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} onNewRoute="new" />
      {(() => {
        if (filteredItems().length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                captions={{
                  thereAreNo: t("shared.noRecords"),
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
                            {filteredItems().map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  {withTenant && <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.tenant.name}</td>}
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {item.active ? (
                                      <ButtonTertiary
                                        onClick={() => {
                                          navigator.clipboard.writeText(item.key);
                                        }}
                                      >
                                        Copy to clipboard
                                      </ButtonTertiary>
                                    ) : (
                                      <span className="text-red-600">{t("shared.inactive")} </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.alias}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {item._count.apiKeyLogs}/{item.max}
                                  </td>
                                  {entities.map((entity) => {
                                    return (
                                      <td key={entity.id} className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center">
                                          <span className={clsx(getEntityPermissions(item, entity, "C") ? " text-gray-800 font-bold" : "text-red-400")}>C</span>
                                          <span className={clsx(getEntityPermissions(item, entity, "R") ? " text-gray-800 font-bold" : "text-red-400")}>R</span>
                                          <span className={clsx(getEntityPermissions(item, entity, "U") ? " text-gray-800 font-bold" : "text-red-400")}>U</span>
                                          <span className={clsx(getEntityPermissions(item, entity, "D") ? " text-gray-800 font-bold" : "text-red-400")}>D</span>
                                        </div>
                                      </td>
                                    );
                                  })}
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <time dateTime={DateUtils.dateYMDHMS(item.expires)} title={DateUtils.dateYMDHMS(item.expires)}>
                                      <span className={clsx(hasExpired(item) ? "" : "")}>{DateUtils.dateAgo(item.expires)}</span>
                                    </time>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
                                      {DateUtils.dateYMDHMS(item.createdAt)}
                                    </time>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <span className="text-gray-400 text-xs">{item.createdByUser.email}</span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                      <ButtonTertiary to={item.id}>{t("shared.edit")}</ButtonTertiary>
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

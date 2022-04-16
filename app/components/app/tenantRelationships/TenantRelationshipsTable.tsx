import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import clsx from "~/utils/shared/ClassesUtils";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import { TenantRelationshipWithDetails } from "~/utils/db/tenantRelationships.db.server";
import { useAppData } from "~/utils/data/useAppData";
import { useParams } from "react-router";
import UrlUtils from "~/utils/app/UrlUtils";
import { TenantRelationshipStatus } from "~/application/enums/tenants/TenantRelationshipStatus";
import { TenantRelationship } from ".prisma/client";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useSubmit } from "remix";

interface Props {
  items: TenantRelationshipWithDetails[];
}

export default function TenantRelationshipsTable({ items }: Props) {
  const appData = useAppData();
  const { t } = useTranslation();
  const params = useParams();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);
  const successModalDeleted = useRef<RefSuccessModal>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const modalReject = useRef<RefConfirmModal>(null);
  const modalAccept = useRef<RefConfirmModal>(null);

  const [sortByColumn, setSortByColumn] = useState("type");
  const [sortDirection, setSortDirection] = useState(-1);
  const headers = [
    {
      title: t("models.tenantRelationship.type"),
    },
    {
      name: "name",
      title: t("models.tenant.object"),
    },
    {
      title: t("shared.status"),
    },
    {
      title: t("shared.actions"),
    },
  ];

  function sortBy(column: string | undefined) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }
  function getTenant(item: TenantRelationshipWithDetails) {
    if (whoAmI(item) === 0) {
      return item.clientTenant;
    } else {
      return item.providerTenant;
    }
  }
  function whoAmI(item: TenantRelationshipWithDetails) {
    if (appData.currentTenant?.id ?? "" === item.providerTenantId) {
      return 0;
    }
    return 1;
  }
  const sortedItems = (): TenantRelationshipWithDetails[] => {
    if (!items) {
      return [];
    }
    const column = sortByColumn;
    if (!column || column === "") {
      return items;
    }
    return items.slice().sort((x, y) => {
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

  function deleteTenantRelationship(item: TenantRelationship) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function confirmedDelete(value: TenantRelationship) {
    const form = new FormData();
    form.set("type", "delete");
    form.set("tenant-relationship-id", value.id);
    submit(form, {
      method: "post",
    });
  }
  function inviterTenant(item: TenantRelationshipWithDetails) {
    if (item.createdByTenantId === item.providerTenantId) {
      return item.providerTenant;
    }
    return item.clientTenant;
  }
  function reject(item: TenantRelationshipWithDetails) {
    const whoAmIName = whoAmI(item) === 0 ? t("models.provider.object") : t("models.client.object");
    if (modalReject.current) {
      modalReject.current.setValue(item);
      modalReject.current.show(
        t("app.tenantRelationships.invitation.confirmReject"),
        t("shared.reject"),
        t("shared.back"),
        t("app.tenantRelationships.invitation.rejectWarning", [whoAmIName, inviterTenant(item).name])
      );
    }
  }
  function accept(item: TenantRelationshipWithDetails) {
    const whoAmIName = whoAmI(item) === 0 ? t("models.provider.object") : t("models.client.object");
    if (modalAccept.current) {
      modalAccept.current.setValue(item);
      modalAccept.current.show(
        t("app.tenantRelationships.invitation.confirmAccept", [whoAmIName]),
        t("shared.accept"),
        t("shared.back"),
        t("app.tenantRelationships.invitation.acceptWarning", [inviterTenant(item).name])
      );
    }
  }
  function accepted(item: TenantRelationshipWithDetails) {
    item.status = 1;
    const form = new FormData();
    form.set("type", "update-status");
    form.set("tenant-relationship-id", item.id);
    form.set("accepted", "true");
    submit(form, {
      method: "post",
    });
  }
  function rejected(item: TenantRelationshipWithDetails) {
    item.status = 2;
    const form = new FormData();
    form.set("type", "update-status");
    form.set("tenant-relationship-id", item.id);
    form.set("accepted", "false");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      {(() => {
        if (sortedItems().length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                captions={{
                  thereAreNo: t("app.tenantRelationships.empty"),
                }}
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
                                  "px-3 py-2 text-left text-xs font-medium text-gray-500 tracking-wider select-none",
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
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedItems().map((link, idx) => {
                          return (
                            <tr key={idx}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                {(() => {
                                  if (whoAmI(link) === 0) {
                                    return (
                                      <span className="flex-shrink-0 inline-block  text-gray-800 text-sm font-medium rounded-sm border-gray-300">
                                        {t("models.client.object")}
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="flex-shrink-0 inline-block  text-gray-800 text-sm font-medium rounded-sm border-gray-300">
                                        {t("models.provider.object")}
                                      </span>
                                    );
                                  }
                                })()}
                              </td>
                              <td className="w-full px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-end">
                                  <div>
                                    <div className="text-sm font-extrabold text-gray-900">{getTenant(link).name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                {link.status === TenantRelationshipStatus.PENDING ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 border border-blue-100 text-blue-900">
                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-blue-400" fill="currentColor" viewBox="0 0 8 8">
                                      <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Pending
                                  </span>
                                ) : link.status === TenantRelationshipStatus.REJECTED ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-rose-50 border border-rose-100 text-rose-900">
                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-rose-400" fill="currentColor" viewBox="0 0 8 8">
                                      <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Rejected
                                  </span>
                                ) : link.status === TenantRelationshipStatus.LINKED ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-teal-50 border border-teal-100 text-teal-900">
                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-teal-400" fill="currentColor" viewBox="0 0 8 8">
                                      <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Linked
                                  </span>
                                ) : (
                                  <div></div>
                                )}
                              </td>
                              <td className="w-20 px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  {link.status === TenantRelationshipStatus.LINKED ? (
                                    <>
                                      <ButtonTertiary to={UrlUtils.currentTenantUrl(params, `contracts/new?l=${link.id}`)}>
                                        <div>{t("app.contracts.new.title")}</div>
                                      </ButtonTertiary>
                                      <ButtonTertiary className="text-gray-600 hover:text-gray-800" onClick={() => deleteTenantRelationship(link)}>
                                        <div>{t("shared.delete")}</div>
                                      </ButtonTertiary>
                                    </>
                                  ) : link.status === TenantRelationshipStatus.PENDING ? (
                                    <>
                                      {link.createdByTenantId === appData.currentTenant.id ? (
                                        <div>
                                          <ButtonTertiary className="text-gray-600 hover:text-gray-800" onClick={() => deleteTenantRelationship(link)}>
                                            <div>{t("shared.delete")}</div>
                                          </ButtonTertiary>
                                        </div>
                                      ) : (
                                        <>
                                          <ButtonTertiary onClick={() => accept(link)}>
                                            <div>{t("shared.accept")}</div>
                                          </ButtonTertiary>
                                          <ButtonTertiary onClick={() => reject(link)}>
                                            <div>{t("shared.reject")}</div>
                                          </ButtonTertiary>
                                        </>
                                      )}
                                    </>
                                  ) : link.status !== TenantRelationshipStatus.PENDING ? (
                                    <ButtonTertiary className="text-gray-600 hover:text-gray-800" onClick={() => deleteTenantRelationship(link)}>
                                      <div>{t("shared.delete")}</div>
                                    </ButtonTertiary>
                                  ) : (
                                    <></>
                                  )}
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
          );
        }
      })()}
      <ConfirmModal ref={modalAccept} onYes={accepted} />
      <ConfirmModal ref={modalReject} onYes={rejected} />
      <SuccessModal ref={successModalDeleted} />
      <ConfirmModal ref={confirmDelete} onYes={confirmedDelete} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

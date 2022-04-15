import { Tenant, TenantUser, User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData, useSubmit } from "remix";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { UsersActionData, UsersActionType } from "~/routes/admin/users";
import { useAdminData } from "~/utils/data/useAdminData";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { adminGetAllUsers, deleteUser } from "~/utils/db/users.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: Awaited<ReturnType<typeof adminGetAllUsers>>;
}
export default function UsersTable({ items }: Props) {
  const adminData = useAdminData();
  const { t } = useTranslation();
  const submit = useSubmit();
  const actionData = useActionData<UsersActionData>();

  const confirmDelete = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [searchInput, setSearchInput] = useState("");
  const headers = [
    {
      title: t("models.user.object"),
    },
    {
      title: t("models.user.tenants"),
    },
    {
      title: t("shared.createdAt"),
    },
    {
      title: t("shared.actions"),
    },
  ];

  useEffect(() => {
    if (actionData?.success) {
      successModal.current?.show(actionData?.success);
    }
    if (actionData?.error) {
      errorModal.current?.show(actionData?.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    const filtered = items.filter((f) => f.firstName?.toString()?.toUpperCase().includes(searchInput.toUpperCase()));

    return filtered.sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return (x.createdAt > y.createdAt ? -1 : 1) ?? -1;
      }
      return -1;
    });
  };

  function impersonate(user: User) {
    const form = new FormData();
    form.set("type", UsersActionType.Impersonate);
    form.set("user-id", user.id);
    submit(form, {
      action: "/admin/users",
      method: "post",
    });
  }
  function changePassword(user: User) {
    const password = prompt(t("settings.profile.changePassword") + " - " + user.email);
    if (password && confirm("[ADMINISTRATOR] Update password for user " + user.email + "?")) {
      const form = new FormData();
      form.set("type", UsersActionType.ChangePassword);
      form.set("user-id", user.id);
      form.set("password-new", password);
      submit(form, {
        action: "/admin/users",
        method: "post",
      });
    }
  }
  function getUserTenants(user: User & { tenants: (TenantUser & { tenant: Tenant })[] }) {
    return user.tenants.map((f) => `${f.tenant?.name} (${t("settings.profile.roles." + TenantUserRole[f.role])})`).join(", ");
  }
  function deleteUser(item: User) {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(item);
      confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("admin.users.deleteWarning"));
    }
  }
  function confirmDeleteUser(item: User) {
    const form = new FormData();
    form.set("type", UsersActionType.DeleteUser);
    form.set("user-id", item.id);
    submit(form, {
      action: "/admin/users",
      method: "post",
    });
  }
  function adminHasPermission(action: "impersonate" | "change-password" | "delete-user") {
    switch (action) {
      case "impersonate":
        return adminData.user.admin?.role === TenantUserRole.OWNER;
      case "change-password":
        return adminData.user.admin?.role === TenantUserRole.OWNER;
      case "delete-user":
        return adminData.user.admin?.role === TenantUserRole.OWNER;
      default:
        return false;
    }
  }

  return (
    <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
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
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>
        {(() => {
          if (filteredItems().length === 0) {
            return (
              <div>
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("app.users.empty"),
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
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                      <div className="flex items-center space-x-4">
                                        <div>
                                          <div className="text-sm font-medium text-gray-900 flex items-baseline space-x-1">
                                            <div>
                                              {item.firstName} {item.lastName}{" "}
                                            </div>
                                            {item.admin && (
                                              <div>
                                                <div className="text-xs text-theme-500">({t("shared.admin")})</div>
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-sm text-gray-500">{item.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                      {item.tenants && item.tenants.length > 0 ? <span>{getUserTenants(item)}</span> : <span>?</span>}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                      <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
                                        {DateUtils.dateAgo(item.createdAt)}
                                      </time>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                      <div className="flex items-center space-x-2">
                                        <ButtonTertiary disabled={!adminHasPermission("impersonate")} onClick={() => impersonate(item)}>
                                          {t("models.user.impersonate")}
                                        </ButtonTertiary>
                                        <ButtonTertiary disabled={!adminHasPermission("change-password")} onClick={() => changePassword(item)}>
                                          {t("settings.profile.changePassword")}
                                        </ButtonTertiary>
                                        <ButtonTertiary disabled={!adminHasPermission("delete-user")} onClick={() => deleteUser(item)} destructive={true}>
                                          {t("shared.delete")}
                                        </ButtonTertiary>
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
        <SuccessModal ref={successModal} />
        <ErrorModal ref={errorModal} />
        <ConfirmModal ref={confirmDelete} onYes={confirmDeleteUser} />
      </div>
    </div>
  );
}

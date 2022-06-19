import { User } from "@prisma/client";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSubmit } from "remix";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import InputSearch from "~/components/ui/input/InputSearch";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { UsersActionType } from "~/routes/admin/users";
import { UserWithDetails } from "~/utils/db/users.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: UserWithDetails[];
  canImpersonate: boolean;
  canChangePassword: boolean;
  canDelete: boolean;
}
export default function UsersTable({ items, canImpersonate, canChangePassword, canDelete }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

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

  function impersonate(user: UserWithDetails) {
    const form = new FormData();
    form.set("action", UsersActionType.Impersonate);
    form.set("user-id", user.id);
    submit(form, {
      action: "/admin/users",
      method: "post",
    });
  }
  function changePassword(user: UserWithDetails) {
    const password = prompt(t("settings.profile.changePassword") + " - " + user.email);
    if (password && confirm("[ADMINISTRATOR] Update password for user " + user.email + "?")) {
      const form = new FormData();
      form.set("action", UsersActionType.ChangePassword);
      form.set("user-id", user.id);
      form.set("password-new", password);
      submit(form, {
        action: "/admin/users",
        method: "post",
      });
    }
  }
  function getUserTenants(user: UserWithDetails) {
    return user.tenants.map((f) => `${f.tenant?.name} (${t("settings.profile.types." + TenantUserType[f.type])})`).join(", ");
  }
  function deleteUser(item: UserWithDetails) {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(item);
      confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("admin.users.deleteWarning"));
    }
  }
  function confirmDeleteUser(item: User) {
    const form = new FormData();
    form.set("action", UsersActionType.DeleteUser);
    form.set("user-id", item.id);
    submit(form, {
      action: "/admin/users",
      method: "post",
    });
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
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
                                      <ButtonTertiary disabled={!canImpersonate} onClick={() => impersonate(item)}>
                                        {t("models.user.impersonate")}
                                      </ButtonTertiary>
                                      <ButtonTertiary disabled={!canChangePassword} onClick={() => changePassword(item)}>
                                        {t("settings.profile.changePassword")}
                                      </ButtonTertiary>
                                      <ButtonTertiary disabled={!canDelete} onClick={() => deleteUser(item)} destructive={true}>
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
      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteUser} />
    </div>
  );
}

import { Role } from "@prisma/client";
import { useTranslation } from "react-i18next";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import { UserWithDetails } from "~/utils/db/users.db.server";

interface Props {
  items: UserWithDetails[];
  roles: Role[];
  className?: string;
  onChange: (item: UserWithDetails, role: Role, add: any) => void;
  tenantId?: string | null;
  disabled?: boolean;
}

export default function UserRolesTable({ items, roles, className, onChange, tenantId = null, disabled }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      {(() => {
        if (items.length === 0) {
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
                              <th scope="col" className="pl-4 w-64 text-xs px-1 py-1 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <div>{t("models.user.plural")}</div>
                                </div>
                              </th>

                              {roles.map((role, idx) => {
                                return (
                                  <th
                                    key={idx}
                                    scope="col"
                                    className="text-xs px-1 py-1 text-center font-medium text-gray-500 tracking-wider select-none truncate"
                                  >
                                    <div className="flex items-center justify-center space-x-1 text-gray-500">{role.name}</div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  <td className="pl-4 px-1 py-1 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex items-center space-x-4 w-64 truncate">
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
                                  {roles.map((role) => {
                                    return (
                                      <td key={role.name} className="px-1 py-1 whitespace-nowrap text-sm text-gray-600 text-center">
                                        <div className="flex justify-center">
                                          <InputCheckbox
                                            disabled={disabled}
                                            name=""
                                            title=""
                                            value={item.roles.find((f) => f.roleId === role.id && f.tenantId === tenantId) !== undefined}
                                            setValue={(e) => onChange(item, role, e)}
                                          />
                                        </div>
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
            </div>
          );
        }
      })()}
    </div>
  );
}

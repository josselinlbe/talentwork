import { useTranslation } from "react-i18next";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import clsx from "~/utils/shared/ClassesUtils";
import ButtonTertiary from "../ui/buttons/ButtonTertiary";
import { Link } from "remix";
import { useAdminData } from "~/utils/data/useAdminData";
import CheckIcon from "../ui/icons/CheckIcon";
import XIcon from "../ui/icons/XIcon";
import { EntityWithCount } from "~/utils/db/entities/entities.db.server";
import LockClosedIcon from "../ui/icons/LockClosedIcon";
import SimpleBadge from "../ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";

interface Props {
  items: EntityWithCount[];
}

type Header = {
  title: string;
  name?: string;
  sortable?: boolean;
};

export default function EntitiesTable({ items }: Props) {
  const { t } = useTranslation();
  const adminData = useAdminData();

  const headers: Header[] = [
    {
      name: "title",
      title: t("models.entity.titlePlural"),
    },
    {
      name: "properties",
      title: t("models.entity.properties"),
    },
    {
      title: t("models.entity.rows"),
    },
    {
      title: t("models.entity.isFeature"),
    },
    // {
    //   title: t("models.entity.requiresLinkedAccounts"),
    // },
    {
      title: t("shared.actions"),
    },
  ];

  function getEntitySlug(item: EntityWithCount) {
    if (adminData.myTenants.length > 0) {
      return `/app/${adminData.myTenants[0].tenant.slug}/${item.slug}`;
    }
    return "";
  }

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
                  <div className="align-middle inline-block min-w-full">
                    <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {headers.map((header, idx) => {
                              return (
                                <th
                                  key={idx}
                                  scope="col"
                                  className={clsx("px-2 py-2 truncate text-left text-xs font-medium text-gray-500 tracking-wider select-none")}
                                >
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
                              <tr className=" text-gray-600">
                                <td className="px-2 py-2 whitespace-nowrap text-gray-700 text-sm">
                                  <div className="flex space-x-1 items-center">
                                    <Link to={"/admin/entities/" + item.slug + "/details"} className="font-medium hover:underline">
                                      {t(item.titlePlural)}
                                    </Link>
                                    {item.isDefault && <LockClosedIcon className="h-3 w-3 text-gray-300" />}
                                    {item.isDefault && <SimpleBadge title={"Default"} color={Colors.GRAY} />}
                                  </div>
                                </td>
                                <td className="w-full px-2 py-2 whitespace-nowrap text-gray-700 text-sm">
                                  <div className="max-w-xs truncate">
                                    {item.properties.filter((f) => !f.isDefault).length > 0 ? (
                                      <Link className="pb-1 hover:underline truncate" to={"/admin/entities/" + item.slug + "/properties"}>
                                        {item.properties
                                          .filter((f) => !f.isDefault)
                                          .map((f) => t(f.title))
                                          .join(", ")}
                                      </Link>
                                    ) : (
                                      <Link className="pb-1 hover:underline truncate text-gray-400" to={"/admin/entities/" + item.slug + "/properties"}>
                                        {t("shared.setCustomProperties")}
                                      </Link>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-sm">
                                  <Link to={"/admin/entities/" + item.slug + "/rows"} className="hover:underline">
                                    {item._count.rows}
                                  </Link>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-sm">
                                  <span>{item.isFeature ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-400" />}</span>
                                </td>
                                {/* <td className="px-2 py-2 whitespace-nowrap text-sm">
                                  <span>
                                    {item.requiresLinkedAccounts ? (
                                      <CheckIcon className="h-4 w-4 text-teal-500" />
                                    ) : (
                                      <XIcon className="h-4 w-4 text-gray-400" />
                                    )}
                                  </span>
                                </td> */}
                                <td className="px-2 py-2 whitespace-nowrap text-sm">
                                  <ButtonTertiary to={"/admin/entities/" + item.slug + "/details"}>{t("shared.edit")}</ButtonTertiary>
                                </td>
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

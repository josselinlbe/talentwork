import { Entity, Tenant } from "@prisma/client";
import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "remix";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputDate from "~/components/ui/input/InputDate";
import InputNumber from "~/components/ui/input/InputNumber";
import InputSelect from "~/components/ui/input/InputSelect";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { useAdminData } from "~/utils/data/useAdminData";
import { ApiKeyWithDetails } from "~/utils/db/apiKeys.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";

interface Props {
  entities: Entity[];
  item?: ApiKeyWithDetails | null;
  tenants?: Tenant[];
}
export default function ApiKeyForm({ entities, item, tenants }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const inputName = useRef<RefInputText>(null);

  const [alias, setAlias] = useState(item?.alias ?? "");
  const [expires, setExpires] = useState<Date | undefined>(item?.expires ?? DateUtils.daysFromDate(new Date(), 30));
  const [active, setActive] = useState(item?.active ?? true);
  const [max, setMax] = useState(item?.max ?? 100);
  const [permissions, setPermissions] = useState<{ entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[]>([]);

  useEffect(() => {
    const permissions: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = [];
    entities.forEach((entity) => {
      const existing = item?.entities.find((f) => f.entityId === entity.id);
      permissions.push({
        entityId: entity.id,
        create: existing?.create ?? true,
        read: existing?.read ?? true,
        update: existing?.update ?? true,
        delete: existing?.delete ?? true,
      });
    });
    setPermissions(permissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => {
      inputName.current?.input.current?.focus();
    }, 100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormGroup id={item?.id} onCancel={() => navigate("/admin/entities")} editing={true}>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {tenants && (
          <>
            <InputSelect
              className="col-span-6"
              name="tenant-id"
              title={t("models.tenant.object")}
              options={
                tenants?.map((tenant) => {
                  return {
                    name: tenant.name,
                    value: tenant.id,
                  };
                }) ?? []
              }
              disabled={tenants === undefined}
            ></InputSelect>
            <InputNumber className="col-span-6" name="max" title={t("models.apiKey.max")} value={max} setValue={setMax} readOnly={tenants === undefined} />
          </>
        )}
        <InputText
          ref={inputName}
          className="col-span-6"
          name="alias"
          title={t("models.apiKey.alias")}
          value={alias}
          setValue={setAlias}
          required
          autoComplete="off"
        />

        <InputDate className="col-span-6" name="expires" title={t("models.apiKey.expires")} value={expires} onChange={setExpires} required autoComplete="off" />

        <div className="flex flex-col col-span-12">
          <div className="overflow-x-auto">
            <div className="py-2 align-middle inline-block min-w-full">
              <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <div>{t("models.entity.object")}</div>
                        </div>
                      </th>
                      <th scope="col" className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                        {t("models.apiKey.create")}
                      </th>
                      <th scope="col" className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                        {t("models.apiKey.read")}
                      </th>
                      <th scope="col" className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                        {t("models.apiKey.update")}
                      </th>
                      <th scope="col" className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                        {t("models.apiKey.delete")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entities.map((item, idx) => {
                      return (
                        <tr key={idx}>
                          <input
                            type="hidden"
                            name="entities[]"
                            value={JSON.stringify({
                              entityId: item.id,
                              create: permissions.find((f) => f.entityId === item.id)?.create ?? false,
                              read: permissions.find((f) => f.entityId === item.id)?.read ?? false,
                              update: permissions.find((f) => f.entityId === item.id)?.update ?? false,
                              delete: permissions.find((f) => f.entityId === item.id)?.delete ?? false,
                            })}
                          />
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">/{item.slug}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            <InputCheckboxInline
                              name=""
                              title=""
                              value={permissions.find((f) => f.entityId === item.id)?.create ?? false}
                              setValue={(e) =>
                                updateItemByIdx(permissions, setPermissions, idx, {
                                  create: e,
                                })
                              }
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            <InputCheckboxInline
                              name=""
                              title=""
                              value={permissions.find((f) => f.entityId === item.id)?.read ?? false}
                              setValue={(e) =>
                                updateItemByIdx(permissions, setPermissions, idx, {
                                  read: e,
                                })
                              }
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            <InputCheckboxInline
                              name=""
                              title=""
                              value={permissions.find((f) => f.entityId === item.id)?.update ?? false}
                              setValue={(e) =>
                                updateItemByIdx(permissions, setPermissions, idx, {
                                  update: e,
                                })
                              }
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            <InputCheckboxInline
                              name=""
                              title=""
                              value={permissions.find((f) => f.entityId === item.id)?.delete ?? false}
                              setValue={(e) =>
                                updateItemByIdx(permissions, setPermissions, idx, {
                                  delete: e,
                                })
                              }
                            />
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

        <InputCheckboxInline className="col-span-12" name="active" title={t("models.apiKey.active")} value={active} setValue={setActive} />
      </div>
    </FormGroup>
  );
}
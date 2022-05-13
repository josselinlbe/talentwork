import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { InputType } from "~/application/enums/shared/InputType";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
import ButtonTertiary from "../buttons/ButtonTertiary";
import InputNumber from "../input/InputNumber";
import InputSelect from "../input/InputSelect";
import InputText from "../input/InputText";

export type Header<T> = {
  title: string;
  name: string;
  type?: InputType;
  value: (item: T) => any;
  formattedValue?: (item: T) => string;
  options?: { name: string; value: number | string; disabled?: boolean }[];
  setValue?: (value: any, idx: number) => void;
  editable?: (item: T) => boolean;
  className?: string;
};
interface Props<T> {
  headers: Header<T>[];
  items: T[];
  actions?: { title: string; onClick?: (idx: number, item: T) => void; onClickRoute?: (idx: number, item: T) => string }[];
}
export default function TableSimple<T>({ headers, items, actions = [] }: Props<T>) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, idxHeader) => {
                    return (
                      <th key={idxHeader} scope="col" className="text-xs px-2 py-1 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                        <div className={clsx("flex items-center space-x-1 text-gray-500", header.className)}>
                          <div>{header.title}</div>
                        </div>
                      </th>
                    );
                  })}
                  {actions.length > 0 && (
                    <th scope="col" className="text-xs px-2 py-1 text-left font-medium text-gray-500 tracking-wider select-none truncate"></th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={headers.length} className="text-center">
                      <div className="p-3 text-gray-500 text-sm">{t("shared.noRecords")}</div>
                    </td>
                  </tr>
                )}
                {items.map((item, idxRow) => {
                  return (
                    <tr key={idxRow}>
                      {headers.map((header, idxHeader) => {
                        return (
                          <td key={idxHeader} className={clsx("px-2 py-2 whitespace-nowrap text-sm text-gray-600", header.className)}>
                            {!header.setValue ? (
                              <>{header.formattedValue ? header.formattedValue(item) : header.value(item)}</>
                            ) : (
                              <>
                                {header.type === undefined || header.type === InputType.TEXT ? (
                                  <InputText
                                    withLabel={false}
                                    name={header.name}
                                    title={header.title}
                                    value={header.value(item)}
                                    disabled={header.editable && !header.editable(item)}
                                    setValue={(e) => {
                                      if (header.setValue) {
                                        header.setValue(e, idxRow);
                                      }
                                    }}
                                    required
                                  />
                                ) : header.type === InputType.NUMBER ? (
                                  <InputNumber
                                    withLabel={false}
                                    name={header.name}
                                    title={header.title}
                                    value={header.value(item)}
                                    disabled={header.editable && !header.editable(item)}
                                    setValue={(e) => {
                                      if (header.setValue) {
                                        header.setValue(e, idxRow);
                                      }
                                    }}
                                    required
                                  />
                                ) : header.type === InputType.SELECT ? (
                                  <InputSelect
                                    withLabel={false}
                                    name={header.name}
                                    title={header.title}
                                    value={header.value(item)}
                                    setValue={(e) => {
                                      if (header.setValue) {
                                        header.setValue(Number(e), idxRow);
                                      }
                                    }}
                                    options={header.options ?? []}
                                    required
                                    disabled={header.editable && !header.editable(item)}
                                  />
                                ) : (
                                  <td></td>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                      {actions && (
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex space-x-2">
                            {actions.map((action) => {
                              return (
                                <ButtonTertiary
                                  key={action.title}
                                  onClick={() => {
                                    if (action.onClick) {
                                      action.onClick(idxRow, item);
                                    }
                                  }}
                                  to={action.onClickRoute && action.onClickRoute(idxRow, item)}
                                >
                                  {action.title}
                                </ButtonTertiary>
                              );
                            })}
                          </div>
                        </td>
                      )}
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

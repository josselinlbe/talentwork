import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { PropertyOption } from "@prisma/client";
import clsx from "clsx";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import SelectorIcon from "~/components/ui/icons/SelectorIcon";
import { useTranslation } from "react-i18next";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import EntityIcon from "~/components/layouts/icons/EntityIcon";

interface Props {
  className?: string;
  field: PropertyWithDetails;
  disabled: boolean;
  parent?: PropertyOption | undefined;
  initial: PropertyOption | undefined;
  parentSelectedValue: RowValueDto | undefined;
  help?: string;
  hint?: ReactNode;
  icon?: string;
  onSelected: (item: PropertyOption | undefined) => void;
}

const PropertyOptionSelector = ({ className, field, parent, disabled, initial, parentSelectedValue, onSelected, help, hint, icon }: Props) => {
  const { t } = useTranslation();

  const button = useRef<HTMLButtonElement>(null);

  const [selected, setSelected] = useState<PropertyOption | undefined>(initial);

  useEffect(() => {
    setSelected(undefined);
  }, [parentSelectedValue]);

  useEffect(() => {
    setSelected(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onSelected(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (parent) {
      setSelected(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent?.id]);

  function hasColors() {
    return field.options.find((f) => f.color);
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={field.name} className="flex justify-between space-x-2 text-xs font-medium text-gray-600 ">
          <div className=" flex space-x-1 items-center">
            <div className="truncate">
              {t(field.title)}
              {field.isRequired && <span className="ml-1 text-red-500">*</span>}
            </div>
            <div className="">{help && <HintTooltip text={help} />}</div>
          </div>
          {hint}
        </label>
        <div className="mt-1">
          <input type="hidden" name={field.name} value={selected?.value} required={field.isRequired} disabled={selected === undefined} />
          <Listbox value={selected} onChange={(e) => setSelected(e)} disabled={disabled}>
            {({ open }) => (
              <>
                <div className={clsx("relative", className)}>
                  <Listbox.Button
                    disabled={true}
                    ref={button}
                    className={clsx(
                      "relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 sm:text-sm",
                      disabled && "bg-gray-100 cursor-not-allowed"
                    )}
                  >
                    {icon && (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EntityIcon className="h-5 w-5 text-gray-400" icon={icon} />
                      </div>
                    )}
                    <div className={clsx("flex items-center space-x-2", icon && "pl-8")}>
                      {selected ? (
                        <>
                          {hasColors() && <ColorBadge color={selected.color} />}
                          <div className="flex space-x-1">
                            <div>{selected.value}</div>
                            {selected.name && (
                              <>
                                <div>-</div>
                                <div>{selected.name}</div>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">
                          {t("shared.select")} <span className="lowercase">{t(field.title)}</span>...
                        </div>
                      )}
                    </div>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {/* {loading && (
                  <li className="select-none relative py-2 pl-3 pr-9">
                    <Loading small />
                  </li>
                )} */}
                      {field.options.filter((f) => !f.parentId || f.parentId === parentSelectedValue?.idValue).length === 0 && (
                        <div className=" p-2 text-red-500 flex justify-center select-none">{!field ? "Select a field type" : "There are no values"}</div>
                      )}
                      {field.options
                        .filter((f) => !f.parentId || f.parentId === parentSelectedValue?.idValue)
                        .sort((a, b) => a.order - b.order)
                        .map((item, idx) => (
                          <Listbox.Option
                            key={idx}
                            className={({ active }) =>
                              clsx(active ? "text-white bg-accent-600" : "text-gray-900", "cursor-default select-none relative py-2 pl-3 pr-9")
                            }
                            value={item}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center space-x-2">
                                  {hasColors() && <ColorBadge color={item.color} />}
                                  <div className="flex space-x-1">
                                    <div>{item.value}</div>
                                    {item.name && (
                                      <>
                                        <div>-</div>
                                        <div>{item.name}</div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {selected ? (
                                  <span className={clsx(active ? "text-white" : "text-accent-600", "absolute inset-y-0 right-0 flex items-center pr-4")}>
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
        </div>
      </div>
      {/* <div>
        {field.options?.map((item, idx) => {
          return <div key={idx}>field: {item.formField?.name}</div>;
          // return <PropertyOptionSelector key={idx} disabled={!selected} field={item} parent={selected} initial={value} onSelected={onSelected} />;
        })}
      </div> */}
    </div>
  );
};

export default PropertyOptionSelector;

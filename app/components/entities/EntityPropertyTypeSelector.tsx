import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import EntityPropertyBadge from "./EntityPropertyBadge";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import SelectorIcon from "../ui/icons/SelectorIcon";
import CheckIcon from "../ui/icons/CheckIcon";

interface Props {
  className?: string;
  items: EntityPropertyType[];
  selected: EntityPropertyType;
  onSelected: (item: EntityPropertyType) => void;
}

export default function EntityPropertyTypeSelector({ className, items, selected, onSelected }: Props) {
  const { t } = useTranslation();
  return (
    <Listbox value={selected} onChange={onSelected}>
      {({ open }) => (
        <>
          <input type="hidden" name="type" value={selected} />
          <div className={clsx("relative", className)}>
            <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-theme-500 focus:border-theme-500 sm:text-sm">
              <div className="flex items-center space-x-2">
                <EntityPropertyBadge type={selected} className="text-gray-500 h-4 w-4" />
                <div className="truncate">{t("entities.fields." + EntityPropertyType[selected])}</div>
              </div>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {items.length === 0 ? (
                  <div className=" p-2 text-red-500 flex justify-center select-none">There are no fields</div>
                ) : (
                  <>
                    {items.map((item, idx) => (
                      <Listbox.Option
                        key={idx}
                        className={({ active }) =>
                          clsx(active ? "text-white bg-theme-600" : "text-gray-900", "cursor-default select-none relative py-2 pl-3 pr-9")
                        }
                        value={item}
                      >
                        {({ selected, active }) => (
                          <>
                            <div className="flex items-center space-x-2">
                              <EntityPropertyBadge type={item} className={clsx(active ? "text-white" : "text-gray-500", "h-4 w-4")} />
                              <div className="truncate">{t("entities.fields." + EntityPropertyType[item])}</div>
                            </div>
                            {selected ? (
                              <span className={clsx(active ? "text-white" : "text-theme-600", "absolute inset-y-0 right-0 flex items-center pr-4")}>
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </>
                )}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}

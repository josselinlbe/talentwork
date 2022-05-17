import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import PropertyBadge from "./PropertyBadge";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import SelectorIcon from "../../ui/icons/SelectorIcon";
import CheckIcon from "../../ui/icons/CheckIcon";

interface Props {
  className?: string;
  selected: PropertyType;
  onSelected: (item: PropertyType) => void;
}

export default function PropertyTypeSelector({ className, selected, onSelected }: Props) {
  const items: PropertyType[] = [
    PropertyType.TEXT,
    PropertyType.NUMBER,
    PropertyType.DATE,
    // PropertyType.USER,
    // PropertyType.ROLE,
    PropertyType.SELECT,
    PropertyType.MEDIA,
    PropertyType.ENTITY,
    // PropertyType.FORMULA,
  ];
  const { t } = useTranslation();
  return (
    <Listbox value={selected} onChange={onSelected}>
      {({ open }) => (
        <>
          <input type="hidden" name="type" value={selected} />
          <div className={clsx("relative", className)}>
            <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 sm:text-sm">
              <div className="flex items-center space-x-2">
                <PropertyBadge type={selected} className="text-gray-500 h-4 w-4" />
                <div className="truncate">{t("entities.fields." + PropertyType[selected])}</div>
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
                          clsx(active ? "text-white bg-accent-600" : "text-gray-900", "cursor-default select-none relative py-2 pl-3 pr-9")
                        }
                        value={item}
                      >
                        {({ selected, active }) => (
                          <>
                            <div className="flex items-center space-x-2">
                              <PropertyBadge type={item} className={clsx(active ? "text-white" : "text-gray-500", "h-4 w-4")} />
                              <div className="truncate">{t("entities.fields." + PropertyType[item])}</div>
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

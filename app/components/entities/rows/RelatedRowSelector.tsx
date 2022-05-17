import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import { forwardRef, Fragment, Ref, useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import SelectorIcon from "~/components/ui/icons/SelectorIcon";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import DateUtils from "~/utils/shared/DateUtils";

export interface RefRelatedRowSelector {
  focus: () => void;
}

interface Props {
  name: string;
  entity: EntityWithDetails;
  items: RowWithDetails[];
  selected: RowWithDetails | undefined;
  className?: string;
  onSelected: (item: RowWithDetails) => void;
}

const RelatedRowSelector = ({ name, className, entity, items, selected, onSelected }: Props, ref: Ref<RefRelatedRowSelector>) => {
  const { t } = useTranslation();
  const button = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({ focus }));
  function focus() {
    button.current?.focus();
  }

  return (
    <Listbox value={selected} onChange={onSelected}>
      {({ open }) => (
        <>
          <div className={clsx("relative", className)}>
            <Listbox.Button
              ref={button}
              className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-theme-500 focus:border-theme-500 sm:text-sm"
            >
              <input type="hidden" readOnly name={name} value={selected?.id} />
              <div className="flex items-center space-x-2 w-full truncate">
                {selected ? (
                  <>
                    <div className="truncate flex-grow flex justify-between space-x-2">
                      <div className="flex space-x-2 justify-between w-full">
                        <div className="truncate">
                          {RowHelper.getRowFolio(entity, selected)} - {DateUtils.dateYMD(selected.createdAt)}
                        </div>
                        <div className=" flex-shrink-0 font-bold">{RowHelper.getRowDescription(entity, selected)}</div>
                        {/* <div className="truncate">{selected.name}</div> */}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 truncate"> Select...</div>
                )}
              </div>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {items.length === 0 ? (
                  <div className=" p-2 text-red-500 flex justify-center select-none">{t("shared.noRecords")}</div>
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
                              <div className={clsx("truncate flex space-x-2 justify-between items-center w-full", active ? "text-white" : "text-gray-500", "")}>
                                <div className="truncate">
                                  <div className="flex space-x-1 items-center">
                                    <div>{RowHelper.getRowFolio(entity, item)}</div>
                                    <div className=" text-xs">({DateUtils.dateYMD(item.createdAt)})</div>
                                  </div>
                                  <div className="truncate">{RowHelper.getRowDescription2(entity, item)}</div>
                                </div>
                                <div className=" flex-shrink-0 font-bold">{RowHelper.getRowDescription(entity, item)}</div>
                              </div>
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
};

export default forwardRef(RelatedRowSelector);

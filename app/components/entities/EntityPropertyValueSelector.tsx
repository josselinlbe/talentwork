import { Fragment, useEffect, useRef, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { EntityProperty, EntityPropertyOption, EntityRowValue } from "@prisma/client";
import clsx from "clsx";
import { EntityPropertyWithDetails } from "~/utils/db/entities.db.server";
import SelectorIcon from "../ui/icons/SelectorIcon";
import CheckIcon from "../ui/icons/CheckIcon";
import { EntityRowPropertyValueDto } from "~/application/dtos/entities/EntityRowPropertyValueDto";
import InputSelect from "../ui/input/InputSelect";

interface Props {
  className?: string;
  field: EntityPropertyWithDetails;
  disabled: boolean;
  parent?: EntityPropertyOption | undefined;
  initial: EntityPropertyOption | undefined;
  parentSelectedValue: EntityRowPropertyValueDto | undefined;
  onSelected: (item: EntityPropertyOption | undefined) => void;
}

const EntityPropertyValueSelector = ({ className, field, parent, disabled, initial, parentSelectedValue, onSelected }: Props) => {
  const button = useRef<HTMLButtonElement>(null);

  const [selected, setSelected] = useState<EntityPropertyOption | undefined>(initial);
  const [value, setValue] = useState<EntityPropertyOption>();

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

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="result" className="block text-xs font-medium text-gray-700">
          {field.title}
          {field.isRequired && <span className="ml-1 text-red-500">*</span>}
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
                    <div className="flex items-center space-x-2">
                      {selected ? (
                        <>{selected.value}</>
                      ) : (
                        <div className="text-gray-500">
                          Select <span className="lowercase">{field.title}</span>...
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
                                <div className="">{item.value}</div>

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
          // return <EntityPropertyValueSelector key={idx} disabled={!selected} field={item} parent={selected} initial={value} onSelected={onSelected} />;
        })}
      </div> */}
    </div>
  );
};

export default EntityPropertyValueSelector;

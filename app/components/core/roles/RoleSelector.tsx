import { forwardRef, Fragment, Ref, useImperativeHandle, useRef } from "react";
import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import SelectorIcon from "~/components/ui/icons/SelectorIcon";
import CheckIcon from "~/components/ui/icons/CheckIcon";

export interface RefRoleSelector {
  focus: () => void;
}

interface Props {
  items: any[];
  className?: string;
  selected: any[];
  disabled?: boolean;
  onSelected: (item: any) => void;
}

const RoleSelector = ({ items, className, selected, disabled, onSelected }: Props, ref: Ref<RefRoleSelector>) => {
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
              disabled={disabled}
              ref={button}
              className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-theme-500 focus:border-theme-500 sm:text-sm"
            >
              <div className="flex items-center space-x-2 truncate">
                {selected.length > 0 ? (
                  <>
                    <div>{selected.map((f) => f.name).join(", ")}</div>
                  </>
                ) : (
                  <div className="text-gray-500">Select roles...</div>
                )}
              </div>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {items.map((item, idx) => (
                  <Listbox.Option
                    key={idx}
                    className={({ active }) => clsx(active ? "text-white bg-theme-600" : "text-gray-900", "cursor-default select-none relative py-2 pl-3 pr-9")}
                    value={item}
                  >
                    {({ active }) => (
                      <>
                        <div className="flex items-center space-x-2 truncate">
                          <div className="truncate">{item.name}</div>
                        </div>

                        {selected.find((f) => f.id === item.id) ? (
                          <span className={clsx(active ? "text-white" : "text-theme-600", "absolute inset-y-0 right-0 flex items-center pr-4")}>
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
  );
};

export default forwardRef(RoleSelector);

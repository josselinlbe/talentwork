import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { forwardRef, Fragment, KeyboardEvent, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useOuterClick } from "~/utils/shared/KeypressUtils";
import { useAppData } from "~/utils/data/useAppData";
import { Link, useParams } from "@remix-run/react";
import { LinkedAccountWithDetailsAndMembers } from "~/utils/db/linkedAccounts.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import clsx from "clsx";

export interface RefLinkedAccountSelector {
  select: (link: LinkedAccountWithDetailsAndMembers) => void;
}

interface Props {
  items: LinkedAccountWithDetailsAndMembers[];
  initial?: string | undefined;
  onSelected?: (id: string, link: LinkedAccountWithDetailsAndMembers) => void;
  disabled?: boolean;
  className?: string;
}

const LinkedAccountSelector = ({ items, initial, className = "", disabled, onSelected }: Props, ref: Ref<RefLinkedAccountSelector>) => {
  const params = useParams();
  const appData = useAppData();
  const { t } = useTranslation();

  const inputSearch = useRef<HTMLInputElement>(null);

  const [opened, setOpened] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<LinkedAccountWithDetailsAndMembers | undefined>(undefined);

  useEffect(() => {
    if (initial) {
      setSelected(items.find((f) => f.id === initial));
    }
  }, [initial, items]);

  useImperativeHandle(ref, () => ({ select }));
  function select(link: LinkedAccountWithDetailsAndMembers) {
    if (onSelected) {
      onSelected(link.id, link);
    }
    close();
    setSelected(link);
    setSearchInput("");
  }
  function toggle() {
    if (!opened) {
      open();
      // nextTick(() => {
      inputSearch.current?.focus();
      inputSearch.current?.select();
      // });
    } else {
      close();
    }
  }
  function open() {
    setOpened(true);
  }
  function close() {
    setOpened(false);
  }
  function trySelect(event: KeyboardEvent) {
    if (event.code === "Enter") {
      if (filteredItems().length > 0) {
        select(filteredItems()[0]);
      }
    }
  }
  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        f.id?.toUpperCase().includes(searchInput.toUpperCase()) ||
        f.providerTenant?.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.clientTenant?.name?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  const clickOutside = useOuterClick(() => setOpened(false));

  return (
    <div className={className} ref={clickOutside}>
      <div>
        <label htmlFor="link" className="block text-xs font-medium text-gray-700 truncate">
          {t("models.linkedAccount.object")}
        </label>

        <div className="mt-1 w-full relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded="true"
            aria-labelledby="listbox-label"
            onClick={toggle}
            disabled={disabled}
            className={clsx(
              "relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 sm:text-sm",
              disabled && "bg-gray-100 cursor-not-allowed"
            )}
          >
            <input type="hidden" readOnly name="linked-account-id" value={selected?.id} />
            {(() => {
              if (selected) {
                return (
                  <span className="w-full inline-flex truncate">
                    {(() => {
                      if (selected.providerTenantId === appData.currentTenant?.id) {
                        return (
                          <div className="flex justify-between space-x-2 w-full">
                            <div className="font-normal truncate">{selected.clientTenant.name}</div>
                            <div className="text-gray-500">
                              <span className="flex-shrink-0 inline-block px-2 py-0.5 text-indigo-800 text-xs font-medium bg-indigo-100 rounded-sm border-indigo-300">
                                {t("models.client.object")}
                              </span>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex justify-between space-x-2 w-full">
                            <div className="font-normal truncate">{selected.providerTenant.name}</div>
                            <div className="text-gray-500">
                              <span className="flex-shrink-0 inline-block px-2 py-0.5 text-theme-800 text-xs font-medium bg-theme-100 rounded-sm border-theme-300">
                                {t("models.provider.object")}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </span>
                );
              } else {
                return (
                  <span className="w-full inline-flex truncate">
                    <span className="truncate">{t("app.linkedAccounts.actions.selectOne")}...</span>
                  </span>
                );
              }
            })()}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              {/*Heroicon name: solid/selector */}
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>

          <Transition as={Fragment} show={opened} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="absolute z-10 mt-1 w-full bg-white shadow-xl max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              <div className="p-2 flex rounded-md">
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    autoComplete="off"
                    onKeyDown={trySelect}
                    placeholder={t("shared.searchDot")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="focus:ring-gray-300 focus:border-theme-300 block w-full rounded-none rounded-l-sm pl-10 sm:text-sm border-gray-300 px-3 py-2 bg-white text-sm border focus:outline-none"
                  />
                </div>
                <Link
                  to={UrlUtils.currentTenantUrl(params, `settings/linked-accounts/new`)}
                  className="-ml-px relative inline-flex items-center space-x-2 px-2 py-2 border border-gray-300 text-sm font-medium rounded-r-sm text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-theme-500 focus:border-theme-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Link>
              </div>
              {(() => {
                if (items.length > 0) {
                  return (
                    <div>
                      <ul tabIndex={-1} role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-0">
                        {filteredItems().map((link, idx) => {
                          return (
                            <li
                              className="cursor-pointer text-gray-900 select-none relative py-2 pl-3 pr-12 hover:bg-slate-100 hover:text-theme-900"
                              id={"listbox-option-" + idx}
                              key={idx}
                              onClick={() => select(link)}
                            >
                              {(() => {
                                if (link.providerTenantId === appData.currentTenant?.id) {
                                  return (
                                    <div className="mr-3 flex justify-between space-x-2 w-full">
                                      {/*Selected: "font-semibold", Not Selected: "font-normal" */}
                                      <div className="font-normal truncate">{link.clientTenant.name}</div>
                                      {/*Highlighted: "text-theme-200", Not Highlighted: "text-gray-500" */}
                                      <div className="text-gray-500">
                                        <span className="flex-shrink-0 inline-block px-2 py-0.5 text-indigo-800 text-xs font-medium bg-indigo-100 rounded-sm border-indigo-300">
                                          {t("models.client.object")}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="mr-3 flex justify-between space-x-2 w-full">
                                      {/*Selected: "font-semibold", Not Selected: "font-normal" */}
                                      <div className="font-normal truncate">{link.providerTenant.name}</div>
                                      {/*Highlighted: "text-theme-200", Not Highlighted: "text-gray-500" */}
                                      <div className="text-gray-500">
                                        <span className="flex-shrink-0 inline-block px-2 py-0.5 text-theme-800 text-xs font-medium bg-theme-100 rounded-sm border-theme-300">
                                          {t("models.provider.object")}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                              })()}

                              {(() => {
                                if (selected && selected.id === link.id) {
                                  return (
                                    <span className="text-theme-600 absolute inset-y-0 right-0 flex items-center pr-4">
                                      {/*Heroicon name: solid/check */}
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </span>
                                  );
                                }
                              })()}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                } else if (items.length === 0) {
                  return <div className="py-2 px-3 text-gray-400 text-sm">{t("app.linkedAccounts.thereAreNo")}</div>;
                } else {
                  return <div></div>;
                }
              })()}
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(LinkedAccountSelector);

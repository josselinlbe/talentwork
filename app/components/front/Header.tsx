import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { Link, useLocation } from "@remix-run/react";
import Logo from "~/components/front/Logo";
import DarkModeToggle from "~/components/ui/toggles/DarkModeToggle";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import Icon from "./Icon";
import LocaleSelector from "../ui/selectors/LocaleSelector";
import { useRootData } from "~/utils/data/useRootData";
import { NavbarItemDto } from "~/application/dtos/marketing/NavbarItemDto";
import HeaderFlyoutItem from "./HeaderFlyoutItem";

export default function Header() {
  const { authenticated, isAdmin } = useRootData();
  const { t } = useTranslation();

  const location = useLocation();

  const [open, setOpen] = useState(false);
  const links: NavbarItemDto[] = [
    { path: "/", title: t("front.navbar.product") },
    { path: "/pricing", title: t("front.navbar.pricing") },
    { path: "/blog", title: t("front.navbar.blog") },
  ];
  function isCurrent(path: string): boolean {
    return location.pathname === path;
  }

  const loginOrEnterRoute = () => {
    if (!authenticated) {
      return "/login";
    }
    return !isAdmin ? `/app` : "/admin";
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 pb-6">
        <div className="relative pt-6 ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="relative flex items-center justify-between sm:h-10 md:justify-center" aria-label="Global">
              <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <Logo className="hidden lg:block" size="h-9" />
                  <Icon className="lg:hidden" size="h-9" />
                  <div className="-mr-1 flex items-center md:hidden">
                    <div className="flex">
                      <div className="inline-flex rounded-md space-x-2">
                        {/* <LocaleSelector className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-gray-900 dark:text-slate-300" /> */}

                        {!authenticated && (
                          <Link
                            to="/register"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-gray-900 dark:text-slate-300"
                          >
                            <div>{t("account.shared.signUp")}</div>
                          </Link>
                        )}
                        <Link
                          to={loginOrEnterRoute()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-gray-900 dark:text-slate-300"
                        >
                          {!authenticated ? <div>{t("shared.tryDemo")}</div> : <div>{t("shared.enter")}</div>}
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpen(!open)}
                      type="button"
                      className="bg-white dark:bg-gray-900 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                      id="main-menu"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">{t("shared.close")}</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex space-x-2 sm:space-x-4 md:space-x-6">
                {links.map((link, idx) => {
                  return (
                    <>
                      {link.path ? (
                        <Link
                          key={idx}
                          to={link.path}
                          className={clsx(
                            link.className,
                            "text-base leading-6 font-medium focus:outline-none transition ease-in-out duration-150 px-3 py-1 rounded-sm",
                            !isCurrent(link.path) && "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                            isCurrent(link.path) && "text-gray-900 dark:text-white"
                          )}
                        >
                          {link.title}
                        </Link>
                      ) : (
                        <HeaderFlyoutItem
                          key={idx}
                          className="text-base leading-6 font-medium focus:outline-none transition ease-in-out duration-150 px-3 py-1 rounded-sm"
                          title={link.title}
                          items={link.items}
                        />
                      )}
                    </>
                  );
                })}
                <LocaleSelector className="hidden lg:block" />
                <DarkModeToggle className="hidden lg:flex" />
              </div>
              <div className="hidden md:absolute md:flex md:items-center md:justify-end md:inset-y-0 md:right-0">
                <span className="inline-flex space-x-2">
                  {!authenticated && (
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-sm text-slate-500 dark:text-white"
                    >
                      {t("account.shared.signUp")}
                    </Link>
                  )}
                  <Link
                    to={loginOrEnterRoute()}
                    className="shadow inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-theme-600 dark:text-white bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:text-slate-300"
                  >
                    {!authenticated ? <div>{t("shared.tryDemo")}</div> : <div>{t("shared.enter")}</div>}
                  </Link>
                </span>
              </div>
            </nav>
          </div>

          {/* Mobile menu */}
          <Transition
            show={open}
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-40">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-xl ring-1 ring-black ring-opacity-5 overflow-visible">
                <div className="px-5 pt-4 flex items-center justify-between">
                  <div>
                    <Icon />
                  </div>
                  <div className="-mr-2">
                    <button
                      onClick={() => setOpen(!open)}
                      type="button"
                      className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                    >
                      <span className="sr-only">{t("shared.close")}</span>
                      {/* Heroicon name: x */}
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div role="menu" aria-orientation="vertical" aria-labelledby="main-menu">
                  <div className="px-2 pt-2 pb-3" role="none">
                    {links.map((link) => {
                      return (
                        <>
                          {link.path ? (
                            <>
                              {link.path.startsWith("https:") ? (
                                <a
                                  key={link.title}
                                  href={link.path}
                                  role="menuitem"
                                  className={clsx(
                                    "block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-slate-800",
                                    isCurrent(link.path) ? "bg-slate-100 dark:bg-gray-900" : ""
                                  )}
                                >
                                  {link.title}
                                </a>
                              ) : (
                                <Link
                                  key={link.title}
                                  to={link.path}
                                  role="menuitem"
                                  className={clsx(
                                    "block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-slate-800",
                                    isCurrent(link.path) ? "bg-slate-100 dark:bg-gray-900" : ""
                                  )}
                                >
                                  {link.title}
                                </Link>
                              )}
                            </>
                          ) : (
                            <>
                              {link.items?.map((subItem, idxSubItem) => {
                                return (
                                  <>
                                    {subItem.path?.startsWith("https:") ? (
                                      <a
                                        key={subItem.title}
                                        href={subItem.path ?? ""}
                                        role="menuitem"
                                        className={clsx(
                                          "block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-slate-800",
                                          isCurrent(subItem.path ?? "") ? "bg-slate-100 dark:bg-gray-900" : ""
                                        )}
                                      >
                                        {subItem.title}
                                      </a>
                                    ) : (
                                      <Link
                                        key={subItem.title}
                                        to={subItem.path ?? ""}
                                        role="menuitem"
                                        className={clsx(
                                          "block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-slate-800",
                                          isCurrent(subItem.path ?? "") ? "bg-slate-100 dark:bg-gray-900" : ""
                                        )}
                                      >
                                        {subItem.title}
                                      </Link>
                                    )}
                                  </>
                                );
                              })}
                              {/* <HeaderFlyoutItem
                                key={idx}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-slate-800"
                                title={link.title}
                                items={link.items}
                              /> */}
                            </>
                          )}
                        </>
                      );
                    })}
                  </div>
                  <div role="none" className="flex space-x-2 items-center">
                    <Link
                      to="/register"
                      className="block w-full px-5 py-3 text-center font-medium text-gray-900 dark:text-slate-300 bg-slate-50 dark:bg-slate-800"
                      role="menuitem"
                    >
                      <div>{t("account.shared.signUp")}</div>
                    </Link>
                    <Link
                      to="/login"
                      className="block w-full px-5 py-3 text-center font-medium text-gray-900 dark:text-slate-300 bg-slate-50 dark:bg-slate-800"
                      role="menuitem"
                    >
                      <div>{t("shared.tryDemo")}</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
}

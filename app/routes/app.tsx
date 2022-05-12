import { Combobox } from "@headlessui/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { json, LoaderFunction, redirect, useLoaderData } from "remix";
import Logo from "~/components/front/Logo";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import { i18nHelper } from "~/locale/i18n.utils";
import UserUtils from "~/utils/app/UserUtils";
import { getMyTenants, MyTenant } from "~/utils/db/tenants.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import { Language } from "remix-i18next";

type LoaderData = {
  myTenants: MyTenant[];
  i18n: Record<string, Language>;
};

export let loader: LoaderFunction = async ({ request }) => {
  let { translations } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user) {
    throw redirect(`/login`);
  }
  const myTenants = await getMyTenants(userInfo.userId);
  const data: LoaderData = {
    i18n: translations,
    myTenants,
  };
  return json(data);
};

export default function AppRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="flex-shrink-0 flex justify-center">
            <Logo />
          </div>
          <div className="sm:flex sm:flex-col sm:align-center">
            <div className="relative max-w-xl mx-auto py-12 sm:py-6 w-full overflow-hidden px-2">
              <svg className="absolute left-full transform translate-x-1/2" width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true">
                <defs>
                  <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-black" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
              </svg>
              <svg
                className="absolute right-full bottom-0 transform -translate-x-1/2"
                width="404"
                height="404"
                fill="none"
                viewBox="0 0 404 404"
                aria-hidden="true"
              >
                <defs>
                  <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-black" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
              </svg>
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t("app.tenants.select")}</h1>
                <p className="mt-4 text-lg leading-6 text-gray-500">
                  {data.myTenants.length === 1 ? (
                    <span>{t("app.tenants.youBelongToOne")}</span>
                  ) : (
                    <span>{t("app.tenants.youBelongToMany", [data.myTenants.length])}</span>
                  )}
                </p>
              </div>
              <div className="mt-12">
                {data.myTenants.length === 0 ? (
                  <EmptyState
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 dark:border-gray-700 rounded-2xl"
                    captions={{
                      thereAreNo: t("api.errors.noOrganizations"),
                    }}
                  />
                ) : (
                  <Combobox
                    as="div"
                    className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 ring-1 ring-black ring-opacity-5 transition-all"
                    onChange={() => {}}
                    value={""}
                  >
                    <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                      {data.myTenants.map((item) => (
                        <Combobox.Option key={item.id} value={item}>
                          {({ active }) => (
                            <>
                              <Link
                                to={`/app/${item.tenant.slug}/dashboard`}
                                className={clsx("flex cursor-pointer select-none rounded-xl p-3", active && "bg-gray-100 dark:bg-gray-800")}
                              >
                                <div className={clsx("flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-theme-600")}>
                                  <span className="inline-flex items-center justify-center h-9 w-9">
                                    <span className="text-sm font-medium leading-none text-theme-200">{UserUtils.getTenantPrefix(item.tenant)}</span>
                                  </span>
                                </div>
                                <div className="ml-4 flex-auto">
                                  <p className={clsx("text-sm font-medium", active ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-100")}>
                                    {item.tenant.name}
                                  </p>
                                  <p className={clsx("text-sm", active ? "text-gray-700 dark:text-gray-400" : "text-gray-500")}>{item.tenant.name}</p>
                                </div>
                              </Link>
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  </Combobox>
                )}
                <div className="mt-4 flex pb-12">
                  <Link to="/app/new-tenant" className="text-sm font-medium text-theme-600 dark:text-theme-400 hover:text-theme-500 w-full text-center">
                    Create an organization<span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

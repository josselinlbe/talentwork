import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import RowHelper from "~/utils/helpers/RowHelper";
import { createUserSession, getUserInfo } from "~/utils/session.server";
import Header from "~/components/front/Header";
import { LoaderDataRowEdit, loaderRowEdit } from "~/modules/rows/loaders/row-edit";
import { actionRowEdit } from "~/modules/rows/actions/row-edit";
import RowEditRoute from "~/modules/rows/routes/RowEditRoute";

export let loader: LoaderFunction = async ({ request, params }) => {
  let { translations } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  if (userInfo.lightOrDarkMode === "dark") {
    return createUserSession(
      {
        userId: userInfo.userId,
        lng: userInfo.lng,
        lightOrDarkMode: "light",
      },
      new URL(request.url).pathname
    );
  }

  const data = await loaderRowEdit(request, params, null, params.entity ?? "", "");
  return json({ ...data, i18n: translations });
};

export const action: ActionFunction = async ({ request, params }) => {
  return await actionRowEdit(request, params, null, params.entity ?? "", "");
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function PublicRowItemRoute() {
  const data = useLoaderData<LoaderDataRowEdit>();
  const { t } = useTranslation();
  return (
    <>
      <div>
        <div>
          <Header />
          <div className="bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:flex-col sm:align-center">
                <div className="relative max-w-7xl mx-auto py-12 sm:py-6 w-full overflow-hidden px-2">
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
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t(data.entity.title)}</h1>
                    <p className="mt-4 text-lg leading-6 text-gray-500">
                      {data.item?.tenant?.name}, {RowHelper.getRowFolio(data.entity, data.item)}
                    </p>
                  </div>
                  <div className="mt-12">
                    <div className="space-y-3 bg-gray-50 border-2 border-gray-300 border-dashed p-6">
                      <RowEditRoute />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    </>
  );
}

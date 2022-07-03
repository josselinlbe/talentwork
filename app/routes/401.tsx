import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import Footer from "~/components/front/Footer";
import Logo from "~/components/front/Logo";
import { i18nHelper } from "~/locale/i18n.utils";

export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);
  return json({
    title: `${t("shared.unauthorized")} | ${process.env.APP_NAME}`,
    i18n: translations,
  });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function Page401() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <div className="">
        <div className="min-h-full pt-16 pb-12 flex flex-col">
          <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex-shrink-0 flex justify-center">
              <Logo />
            </div>
            <div className="py-16">
              <div className="text-center">
                <p className="text-sm font-semibold text-theme-600 uppercase tracking-wide">{t("shared.unauthorized")}</p>
                <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">You're not authorized to see this page.</h1>
                <p className="mt-2 text-base text-gray-500">Contact your admin and verify your permissions.</p>
                <div className="mt-4 flex">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-sm font-medium text-theme-600 dark:text-theme-400 hover:text-theme-500 w-full text-center"
                  >
                    <span aria-hidden="true"> &larr;</span> Go back
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

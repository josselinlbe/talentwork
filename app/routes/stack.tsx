import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Language } from "remix-i18next";
import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import { i18nHelper } from "~/locale/i18n.utils";
import LogoCloudsColor from "~/components/ui/images/LogoCloudsColor";

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
};
export let loader: LoaderFunction = async ({ request }) => {
  let { translations } = await i18nHelper(request);
  const data: LoaderData = {
    title: `Stack | ${process.env.APP_NAME}`,
    i18n: translations,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
  description: "The Remix + Tailwind CSS + Prisma boilerplate for SaaS applications",
});

export default function StackRoute() {
  return (
    <div>
      <div>
        <Header />
        <div className="bg-white dark:bg-gray-900">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
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
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">First-class tech stack</h1>
                  <p className="mt-4 text-lg leading-6 text-gray-500 dark:text-gray-400">
                    The Remix + Tailwind CSS + Prisma Boilerplate for SaaS applications.
                  </p>
                </div>
                <div className="mt-12 mx-auto min-h-full">
                  <LogoCloudsColor />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
}

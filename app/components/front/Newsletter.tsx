import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useFetcher } from "@remix-run/react";

const social = [
  {
    name: "Twitter",
    href: "https://twitter.com/talentwork",
    icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
    ),
  },
  {
    name: "Linkedin",
    href: "https://linkedin.com/company/talentworkio",
    icon: (props: any) => (
        <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24" {...props}>
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
    ),
  }
];

export default function Newsletter() {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const state: "idle" | "success" | "error" | "submitting" = fetcher.submission
    ? "submitting"
    : fetcher.data?.subscription
    ? "success"
    : fetcher.data?.error
    ? "error"
    : "idle";
  return (
    <div className="py-12">
      <div className="relative sm:py-16">
        <div aria-hidden="true" className="hidden sm:block">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gray-50 dark:bg-gray-800 rounded-r-3xl" />
          <svg className="absolute top-8 left-1/2 -ml-3" width={404} height={392} fill="none" viewBox="0 0 404 392">
            <defs>
              <pattern id="8228f071-bcee-4ec8-905a-2a059a2cc4fb" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
                <rect x={0} y={0} width={4} height={4} className="text-gray-200 dark:text-gray-800" fill="currentColor" />
              </pattern>
            </defs>
            <rect width={404} height={392} fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)" />
          </svg>
        </div>
        <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="relative rounded-2xl px-6 py-10 bg-theme-600 overflow-hidden shadow-xl sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0">
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 1463 360"
              >
                <path className="text-theme-500 text-opacity-40" fill="currentColor" d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z" />
                <path className="text-theme-700 text-opacity-40" fill="currentColor" d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z" />
              </svg>
            </div>
            <div className="relative">
              <div className="sm:text-center">
                <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">{t("front.newsletter.title")}</h2>
                <p className="mt-6 mx-auto max-w-2xl text-lg text-theme-200">{t("front.newsletter.headline")}</p>
              </div>
              <fetcher.Form method="post" action="/newsletter" className="mt-12 sm:mx-auto sm:max-w-lg sm:flex">
                <div className="min-w-0 flex-1">
                  <label htmlFor="email" className="sr-only">
                    {t("front.contact.email")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full border border-transparent rounded-md px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-theme-600"
                    placeholder={t("front.newsletter.email")}
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-3">
                  <button
                    type="submit"
                    className={clsx(
                      "block w-full rounded-md border border-transparent px-5 py-3 bg-theme-500 text-base font-medium text-white shadow focus:outline-none sm:px-10",
                      state === "submitting"
                        ? "opacity-80 cursor-not-allowed"
                        : "focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-theme-600 hover:bg-theme-400"
                    )}
                  >
                    {state === "submitting" ? t("front.newsletter.subscribing") + "..." : t("front.newsletter.subscribe")}
                  </button>
                </div>
              </fetcher.Form>
              <div className="text-white mx-auto mt-2 text-center">
                {state === "success" ? (
                  <div>
                    <p>{t("front.newsletter.checkEmail")}</p>
                  </div>
                ) : state === "error" ? (
                  <p>{fetcher.data.message}</p>
                ) : (
                  <div></div>
                )}
              </div>

              <div className="flex space-x-4 items-center justify-center mt-10">
                {social.map((item) => (
                  <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-7 w-7 text-gray-100 hover:text-gray-200" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

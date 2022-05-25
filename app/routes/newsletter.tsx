import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, MetaFunction } from "remix";
import { Form, Link, useActionData, useTransition } from "remix";
import { Language } from "remix-i18next";
import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import Tabs from "~/components/ui/tabs/Tabs";
import { i18nHelper } from "~/locale/i18n.utils";

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
};
export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("front.newsletter.title")} | ${process.env.APP_NAME}`,
    i18n: translations,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export const action: ActionFunction = async ({ request }) => {
  await new Promise((res) => setTimeout(res, 1000));
  const formData = await request.formData();
  const email = formData.get("email");

  const API_KEY = process.env.CONVERTKIT_APIKEY;
  const FORM_ID = process.env.CONVERTKIT_FORM;
  const API = "https://api.convertkit.com/v3";

  const res = await fetch(`${API}/forms/${FORM_ID}/subscribe`, {
    method: "post",
    body: JSON.stringify({ email, api_key: API_KEY }),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  return res.json();
};

export default function NewsletterRoute() {
  const { t } = useTranslation();
  const actionData = useActionData();
  const transition = useTransition();
  const state: "idle" | "success" | "error" | "submitting" = transition.submission
    ? "submitting"
    : actionData?.subscription
    ? "success"
    : actionData?.error
    ? "error"
    : "idle";

  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    if (state === "error") {
      inputRef.current?.focus();
    }

    if (state === "idle" && mounted.current) {
      inputRef.current?.select();
    }

    mounted.current = true;
  }, [state]);

  return (
    <div>
      <div>
        <Header />
        <div className="bg-white dark:bg-gray-900">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:flex-col sm:align-center">
              <div className="relative max-w-2xl mx-auto py-12 sm:py-6 w-full overflow-hidden px-2">
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
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t("front.newsletter.title")}</h1>
                  <p className="mt-4 text-lg leading-6 text-gray-500 dark:text-gray-400">{t("front.newsletter.headline")}</p>
                </div>
                <div className="flex justify-center mt-6">
                  <Tabs
                    breakpoint="sm"
                    tabs={[
                      {
                        name: t("blog.title"),
                        routePath: "/blog",
                      },
                      {
                        name: t("front.changelog.title"),
                        routePath: "/changelog",
                      },
                      {
                        name: t("front.newsletter.title"),
                        routePath: "/newsletter",
                      },
                      {
                        name: t("front.contact.title"),
                        routePath: "/contact",
                      },
                    ]}
                  />
                </div>
                <div className="mt-12 mx-auto">
                  <Form replace method="post" aria-hidden={state === "success"} className="mt-9 space-y-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-slate-300">
                        {t("front.contact.email")}
                      </label>
                      <div className="mt-1">
                        <input
                          required
                          aria-label="Email address"
                          aria-describedby="error-message"
                          ref={inputRef}
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-slate-200 appearance-none rounded-none relative block w-full px-3 py-2 border-gray-300 dark:border-gray-600 placeholder-gray-500 rounded-b-sm focus:outline-none focus:ring-theme-300 focus:border-theme-300 focus:z-10 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between space-x-2">
                      <div>
                        {state === "success" ? (
                          <div>
                            <p>{t("front.newsletter.checkEmail")}</p>
                          </div>
                        ) : state === "error" ? (
                          <p>{actionData.message}</p>
                        ) : (
                          <div></div>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-theme-500 hover:bg-theme-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                      >
                        {state === "submitting" ? t("front.newsletter.subscribing") + "..." : t("front.newsletter.subscribe")}
                      </button>
                    </div>
                  </Form>
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

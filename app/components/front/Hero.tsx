/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { useTranslation } from "react-i18next";
import { Link } from "remix";
import Carousel from "../ui/images/Carousel";
import Header from "./Header";

const featureImages = [
  {
    title: "/admin/dashboard",
    route: "/admin/dashboard",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-dashboard.png",
  },
  {
    title: "/admin/users",
    route: "/admin/users",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-users.png",
  },
  {
    title: "/admin/blog",
    route: "/admin/blog",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-blog.png",
  },
  {
    title: "/admin/events",
    route: "/admin/events",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-events.png",
  },
  {
    title: "/admin/setup/pricing",
    route: "/admin/setup/pricing",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-pricing.png",
  },
  {
    title: "/admin/setup/emails",
    route: "/admin/setup/emails",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-emails.png",
  },
  {
    title: "/app/dashboard",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-dashboard.png",
  },
  {
    title: "/app/profile",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-profile.png",
  },
  {
    title: "/app/members",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-members.png",
  },
  {
    title: "/app/subscription",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-subscription.png",
  },
  {
    title: "/app/tenant",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-tenant.png",
  },
  {
    title: "Command Palette",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-command-palette.png",
  },
];

export default function Hero() {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <Header />
      <div className="relative overflow-hidden">
        <div className="hidden lg:block lg:absolute lg:inset-0" aria-hidden="true">
          <svg className="absolute top-0 left-1/2 transform translate-x-64 -translate-y-8" width={640} height={784} fill="none" viewBox="0 0 640 784">
            <defs>
              <pattern id="9ebea6f4-a1f5-4d96-8c4e-4c2abf658047" x={118} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
                <rect x={0} y={0} width={4} height={4} className="text-gray-200 dark:text-gray-800" fill="currentColor" />
              </pattern>
            </defs>
            <rect y={72} width={640} height={640} className="text-white dark:text-gray-900" fill="currentColor" />
            <rect x={118} width={404} height={784} fill="url(#9ebea6f4-a1f5-4d96-8c4e-4c2abf658047)" />
          </svg>
        </div>

        <div className="relative pb-16 sm:pb-24 lg:pb-32">
          <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-16 sm:px-6 lg:mt-16">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1>
                  <span className="block font-semibold uppercase tracking-wide text-sm text-center lg:text-left">{t("front.hero.topHint")}</span>
                  <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-4xl xl:text-5xl">
                    <span className="flex space-x-2 justify-center lg:justify-start items-center">
                      <span className="dark:text-white border-b-4 border-transparent">{t("front.hero.headline1")}</span>{" "}
                      <span className="dark:text-white border-b-4 border-dashed border-b-theme-400 bg-theme-50 dark:bg-theme-900 ">
                        {t("front.hero.headline2")}
                      </span>
                    </span>
                    <span className="flex space-x-2 justify-center lg:justify-start items-center">
                      <span className="dark:text-white border-b-4 border-transparent">{t("front.hero.headline3")}</span>
                      <span className="dark:text-white border-b-4 border-dashed border-b-theme-400 bg-theme-50 dark:bg-theme-900 ">
                        {t("front.hero.headline4")}
                      </span>
                      {/* <span className="dark:text-white border-b-4 border-transparent">{t("front.hero.headline5")}</span> */}
                    </span>
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-600 dark:text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl text-center lg:text-left">
                  {t("front.hero.headline5")}
                </p>

                <div className="mt-5 max-w-md mx-auto lg:mx-0 sm:flex justify-center lg:justify-start md:mt-8">
                  <div className="rounded-md shadow">
                    <a
                      href="https://alexandromg.gumroad.com/l/SaasFrontends-Remix"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md bg-theme-500 text-theme-50 hover:bg-theme-600 md:py-4 md:text-lg md:px-10"
                    >
                      {t("front.hero.buy")}
                    </a>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-theme-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      {t("front.hero.try")}
                    </Link>
                  </div>
                </div>

                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 ">
                  <Link
                    to="/changelog"
                    className="text-sm border-b border-dashed border-accent-500 dark:border-cyan-300 text-gray-800 dark:text-white hover:border-dotted"
                  >
                    {t("front.hero.headline6")}
                  </Link>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-2xl sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <Carousel images={featureImages} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

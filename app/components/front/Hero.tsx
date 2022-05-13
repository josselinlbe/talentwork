import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "remix";
import Carousel from "../ui/images/Carousel";
import Header from "./Header";
import RemixLight from "~/assets/img/remix-light.png";
import RemixDark from "~/assets/img/remix-dark.png";

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
            <div>
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="relative z-10 pb-6 text-3xl sm:text-5xl md:text-6xl lg:text-7.5xl font-extrabold tracking-snug text-center leading-11 sm:leading-15 md:leading-18 lg:leading-22 text-gray-900 dark:text-white">
                  <span className="flex space-x-1 justify-center items-center">
                    {/* <span className="text-theme-500 dark:text-white">{t("front.hero.headline1")}</span> */}
                    <span className="">
                      <img className={clsx("h-7 sm:h-11 md:h-14 pt-0.5", "hidden dark:block w-auto mx-auto")} src={RemixDark} alt="Logo" />
                      <img className={clsx("h-7 sm:h-11 md:h-14 pt-0.5", "dark:hidden w-auto mx-auto")} src={RemixLight} alt="Logo" />
                    </span>
                    <span className="dark:text-cyan-300">{t("front.hero.headline2")}</span>
                  </span>
                  <span className="dark:text-white">
                    {t("front.hero.to")} <span className="dark:text-green-300">{t("front.hero.build")}</span> {t("front.hero.yourOwn")}{" "}
                    <span className="dark:text-yellow-300">{t("front.hero.saas")}</span>
                  </span>
                </h1>
                <div className="relative z-10 pb-10 text-gray-500 text-lg md:text-2xl text-center leading-normal md:leading-9">
                  <p className="sm:text-lg max-w-2xl mx-auto">{t("front.hero.headline4")}</p>
                </div>

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
            </div>
            <div className="mt-12 relative sm:max-w-2xl sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <Carousel images={featureImages} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

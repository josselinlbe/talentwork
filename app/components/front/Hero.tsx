import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "remix";
import Carousel from "../ui/images/Carousel";
import Header from "./Header";
import RemixLight from "~/assets/img/remix-light.png";
import RemixDark from "~/assets/img/remix-dark.png";

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

        <div className="relative">
          <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-16 sm:px-6 lg:mt-16">
            <div>
              <div className="sm:text-center md:max-w-5xl md:mx-auto lg:col-span-6 space-y-3">
                <h1 className="font-extrabold text-7xl flex flex-col">
                  <span>{t("front.hero.headline1")}</span>
                </h1>
                <div className="relative z-10 pb-10 text-gray-500 text-lg md:text-2xl text-center leading-normal md:leading-9">
                  <p className="sm:text-2xl mx-auto max-w-4xl">{t("front.hero.headline2")}</p>
                </div>

                <div className="mt-2 mx-auto lg:mx-0 sm:flex justify-center md:mt-2">
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
                    <a
                      href="#features"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-theme-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      {t("front.hero.features")}
                    </a>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    to="/changelog"
                    className="text-sm border-b border-dashed border-accent-500 dark:border-cyan-300 text-gray-800 dark:text-white hover:border-dotted"
                  >
                    {t("front.hero.hint")}
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

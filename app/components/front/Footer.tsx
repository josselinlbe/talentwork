import { useTranslation } from "react-i18next";
import Icon from "./Icon";

const navigation = {
  features1: [
    { name: "Feat 1", href: "#" },
    { name: "Feat 2", href: "#" },
    { name: "Feat 3", href: "#" },
    { name: "Feat 4", href: "#" },
    { name: "Feat 5", href: "#" },
    { name: "Feat 6", href: "#" },
  ],
  application: [
    { name: "Sign in", href: "/login" },
    { name: "Sign up", href: "/register" },
  ],
  product: [
    { name: "Pricing", href: "/pricing" },
    { name: "Changelog", href: "/changelog" },
    { name: "Contact", href: "/contact" },
    { name: "Newsletter", href: "/newsletter" },
    { name: "Terms", href: "/terms-and-conditions" },
    { name: "Privacy", href: "/privacy-policy" },
  ],
  social: [
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
    },
  ],
};

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="max-w-7xl mx-auto py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Icon className="h-10 w-auto" />
            <p className="text-gray-500 text-base">{t("front.hero.headline2")}</p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 xl:mt-0 xl:col-span-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Core Features</h3>
              <ul className="mt-4 space-y-4">
                {navigation.features1.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Demo</h3>
              <ul className="mt-4 space-y-4">
                {navigation.application.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-0">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            Copyright © Talentwork
          </p>
        </div>
      </div>
    </footer>
  );
}

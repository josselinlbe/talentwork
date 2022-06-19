import { Link } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { getFeatures } from "~/utils/services/marketingService";
import CheckIcon from "../ui/icons/CheckIcon";

const groups = [
  {
    headline: "🪨 Rock-solid features",
    subheadline: "A rock-solid starter kit",
    description: "Everything you need to start to build an MVP, or to build a whole SaaS application in a few weeks.",
    items: [...getFeatures()],
  },
  {
    headline: "First-class tech stack 💪",
    subheadline: "Powered by the best tools",
    description: "The codebase comes with the latest technology out there: SSR, utility-first CSS, and first-class ORM.",
    items: [
      {
        name: "Remix",
        description: "Focused on web standards and modern web app UX, you’re simply going to build better websites.",
        link: "https://remix.run/docs/en/v1",
      },
      {
        name: "React",
        description: "A JavaScript library for building user interfaces.",
        link: "https://reactjs.org/docs/getting-started.html",
      },
      {
        name: "Tailwind CSS",
        description: "Rapidly build modern websites without ever leaving your HTML. The best utility-first CSS framework.",
        link: "https://tailwindcss.com/docs/utility-first",
      },
      {
        name: "Prisma",
        description: "Next-generation Node.js and TypeScript ORM.",
        link: "https://www.prisma.io/docs",
      },
    ],
  },
  {
    headline: "Integrations 🔗",
    subheadline: "Connect with your apps",
    description: "Using Webhooks by Zapier, integrate with +4,000 apps, such as Notion, Airtable, Google Sheets/Docs, and more.",
    items: [
      {
        name: "Stripe",
        description: "The payments infrastructure for the internet. Stripe Customers, Products, and Prices.",
        link: "https://stripe.com/docs",
      },
      {
        name: "Postmark",
        description: "The email delivery service that people actually like. Customize your transactional email templates (Welcome, Forgot password...).",
        link: "https://postmarkapp.com/developer",
      },
      {
        name: "ConvertKit",
        description: (
          <div>
            The creator marketing platform for your newsletter. Used at{" "}
            <Link to="/newsletter" className="font-bold">
              /newsletter
            </Link>
            .
          </div>
        ),
        link: "https://developers.convertkit.com/",
      },
      {
        name: "Formspree",
        description: (
          <div>
            Let your visitors contact you with a form. Used at{" "}
            <Link to="/contact" className="font-bold">
              /contact
            </Link>
            .
          </div>
        ),
        link: "https://formspree.io/",
      },
      {
        name: "Webhooks by Zapier",
        description: "Hook with Zapier by using the Custom Entity events (Created, Updated, and Deleted).",
        link: "https://platform.zapier.com/docs/zapier-intro",
      },
      {
        name: "Deployment",
        description:
          "Deploy your Remix SaaS application on Vercel, Netlify, Cloudflare Workers, Fly.io, or use your own server (this site uses Vercel + Supabase).",
        link: "https://remix.run/docs/en/v1/guides/deployment",
      },
    ],
  },
];

export default function Features() {
  const { t } = useTranslation();
  return (
    <div id="features">
      {groups.map((group) => {
        return (
          <div key={group.headline} className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-3 lg:gap-x-8">
            <div className="z-50">
              <h2 className="text-base font-semibold text-theme-600 uppercase tracking-wide">{group.subheadline}</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{group.headline}</p>
              <p className="mt-4 text-lg text-gray-500">{group.description}</p>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-2">
              <dl
                className={clsx(
                  "space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:grid-flow-col sm:gap-x-6 sm:gap-y-10 lg:gap-x-8",
                  group.items.length <= 2 && "sm:grid-rows-1",
                  group.items.length > 2 && group.items.length <= 4 && "sm:grid-rows-2",
                  (group.items.length === 5 || group.items.length === 6) && "sm:grid-rows-3",
                  group.items.length > 6 && "sm:grid-rows-5",
                  group.items.length > 10 && "sm:grid-rows-6"
                )}
              >
                {group.items.map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <CheckIcon className="absolute h-6 w-6 text-theme-500" aria-hidden="true" />
                      <p className="ml-9 text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.name}</p>
                    </dt>
                    <dd className="mt-2 ml-9 text-base text-gray-500">
                      {feature.description}{" "}
                      {feature.link && (
                        <div>
                          {feature.link.startsWith("http") ? (
                            <a
                              className="mt-2 inline-flex items-center py-1 px-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-accent-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-200 focus:text-accent-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 no-underline"
                              href={feature.link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t("shared.readDocs")}
                            </a>
                          ) : (
                            <Link
                              className="mt-2 inline-flex items-center py-1 px-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-accent-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-200 focus:text-accent-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 no-underline"
                              to={feature.link}
                            >
                              {t("shared.learnMore")}
                            </Link>
                          )}
                        </div>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        );
      })}
    </div>
  );
}

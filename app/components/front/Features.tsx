import { Link } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { getFeatures } from "~/utils/services/marketingService";
import CheckIcon from "../ui/icons/CheckIcon";

const groups = [
  {
    headline: "Everything you need to manage your network",
    subheadline: "A rock-solid dashboard",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    items: [...getFeatures()],
  },
  {
    headline: "First-class freelancer stack 💪",
    subheadline: "Powered by the best tools",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    items: [
      {
        name: "Your own live talents pool",
        description: "Say goodbye to your spreadsheets, and replace them with a searchable live talent pool of all your freelancers."
      },
      {
        name: "Easy invite",
        description: "Invite your own freelancers to your own talent pool by just filling in their email address and name."
      },
      {
        name: "Filter & search",
        description: "Filter and search enables companies to quickly locate their talent based on: price, availability, services, location, status and language."
      },
      {
        name: "Self serving profiles",
        description: "Talentwork gives your talent the possibility to create, control and customize their own profile. which saves time, since there are no longer excel sheets needing updates."
      },
      {
        name: "Import excel list",
        description: "In just a few clicks you can transform your entire excel list into a live talent pool by using the import function."
      },
    ],
  }
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

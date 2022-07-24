import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { i18nHelper } from "~/locale/i18n.utils";
import ChangelogIssues, { ChangelogItem } from "~/components/front/ChangelogIssues";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  items: ChangelogItem[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);

  const changelogItems: ChangelogItem[] = [
    {
      date: "July 24, 2022",
      releaseTag: "0.0.1",
      title: "First version 🔥",
      description: "Release of Talentwork website",
      added: [],
      closed: [],
    },
  ];

  return json({
    title: `${t("front.changelog.title")} | ${process.env.APP_NAME}`,
    i18n: translations,
    items: changelogItems,
  });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function ChangelogRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

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
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t("front.changelog.title")}</h1>
                  <p className="mt-4 text-lg leading-6 text-gray-500 dark:text-gray-400">{t("front.changelog.headline")}</p>
                </div>
                {/* <div className="flex justify-center mt-6">
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
                      // {
                      //   name: t("front.newsletter.title"),
                      //   routePath: "/newsletter",
                      // },
                      {
                        name: t("front.contact.title"),
                        routePath: "/contact",
                      },
                    ]}
                  />
                </div> */}
                <div className="mt-12 mx-auto">
                  <div className="prose text-sm text-black dark:text-white">
                    {/* <div className=" col-span-1">
                        {data.items.map((item) => {
                          return (
                            <div className="">
                              <a className="text-black dark:text-white" href={"#" + UrlUtils.slugify(item.date, 0)}>
                                {item.date}
                              </a>
                            </div>
                          );
                        })}
                      </div> */}
                    <div className="relative border-l border-gray-200 dark:border-gray-700">
                      {data.items.map((item, idx) => {
                        return (
                          <div key={idx} className="mb-10 ml-4">
                            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                            <time id={UrlUtils.slugify(item.date, 0)} className="text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                              {item.date}{" "}
                              {item.releaseTag && (
                                <span>
                                  -{" "}
                                  v{item.releaseTag}
                                </span>
                              )}
                            </time>
                            <h2 id={UrlUtils.slugify(item.date, 0)} className="text-black dark:text-white w-full">
                              {item.title}
                            </h2>
                            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{item.description}</p>

                            {/* {item.url && (
                              <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                                {item.url.startsWith("http") ? (
                                  <a href={item.url} className="text-sm">
                                    Read more.
                                  </a>
                                ) : (
                                  <Link to={item.url} className="text-sm">
                                    Read more.
                                  </Link>
                                )}
                              </p>
                            )} */}

                            {item.videos && (
                              <div>
                                <h2 className="text-black dark:text-white font-semibold text-sm">Videos</h2>
                                <ul>
                                  {item.videos.map((video, idx) => {
                                    return (
                                      <li key={idx}>
                                        <a href={video.url} className="text-theme-600 dark:text-theme-400">
                                          🎥 {video.title}
                                        </a>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            <ChangelogIssues title="Done" items={item.closed} icon="✅" />
                            <ChangelogIssues title="Added issues" items={item.added} icon="⌛" />

                            {item.url && (
                              <a
                                href={item.url}
                                className="mt-5 inline-flex items-center py-2 px-4 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-accent-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-200 focus:text-accent-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 no-underline"
                              >
                                Learn more{" "}
                                <svg className="ml-2 w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fillRule="evenodd"
                                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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

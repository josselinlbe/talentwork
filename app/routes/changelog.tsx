import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { useTranslation } from "react-i18next";
import { i18nHelper } from "~/locale/i18n.utils";
import ChangelogIssues, { ChangelogItem } from "~/components/front/ChangelogIssues";
import UrlUtils from "~/utils/app/UrlUtils";
import Tabs from "~/components/ui/tabs/Tabs";

type LoaderData = {
  items: ChangelogItem[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);

  const changelogItems: ChangelogItem[] = [
    {
      date: "April 28, 2022",
      releaseTag: "0.2.5",
      title: "Blogging",
      description: "Added /blog, /blog/:slug, /admin/blog and /admin/blog/new.",
      url: "https://dev.to/alexandromtzg/remix-saas-kit-changelog-4-blogging-4n70",
      added: [],
      closed: [
        {
          title: "Add Page: Blog #12",
          img: [
            { title: "/blog", img: "https://user-images.githubusercontent.com/8606530/165638974-4f19345e-6f1b-446e-b56f-a8bd39cfa5ce.png" },
            { title: "/admin/blog", img: "https://user-images.githubusercontent.com/8606530/165638982-0689a332-9658-4c1a-92ec-e2408a160a67.png" },
            { title: "/admin/blog/new", img: "https://user-images.githubusercontent.com/8606530/165643515-c26bc41f-9247-4e9a-8c67-d623124ff2f4.png" },
            { title: "/blog/:slug", img: "https://user-images.githubusercontent.com/8606530/165643892-6279cc94-3b13-405b-af08-a1a9c1c7d2d5.png" },
          ],
        },
      ],
    },
    {
      date: "April 19, 2022",
      releaseTag: "0.2.3",
      title: "Custom Pricing Plans builder",
      description: "Now you can create subscription plans with: Title, Badge, Description, Features, and Monthly/Yearly Price.",
      url: "https://dev.to/alexandromtzg/remix-saas-kit-changelog-3-custom-pricing-plan-builder-28cp",
      added: [
        {
          title: "Epic Feature: Entity Builder #41",
          img: [],
        },
      ],
      closed: [
        {
          title: "Create custom pricing plans #40",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/164090549-df28b2a1-2fff-4e83-9f51-e6f0d05fed77.png" }],
        },
        {
          title: "Delete a Tenant as Admin #37",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/164090789-800e1c40-a804-4b07-ab03-24107ace5e0b.png" }],
        },
      ],
    },
    {
      date: "April 12, 2022",
      title: "Tenant on URL",
      releaseTag: "0.2.2",
      description: "Now you can access the tenant with the URL, and added App/Admin Command palettes, Dashboards, and User events.",
      url: "https://dev.to/alexandromtzg/remix-saas-kit-changelog-2-tenant-on-url-command-palette-dashboards-and-user-events-45b1",
      added: [
        {
          title: "Feature flags #19",
          img: [],
        },
        {
          title: "Add Module (a minimal version): Support Desk #20",
          img: [],
        },
        {
          title: "Add Module (a minimal version): CRM #21",
          img: [],
        },
        {
          title: "Add Module (a minimal version): Email #22",
          img: [],
        },
        {
          title: "Add multiple Admin users #28",
          img: [],
        },
        {
          title: "API Keys for end-users #29",
          img: [],
        },
      ],
      closed: [
        {
          title: "Remove TenantSelector and WorkspaceSelector and have {tenantId}/{workspaceId} on the URL #13",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162983102-142dc22c-f2f5-491f-a463-7904bf22220c.png" }],
        },
        {
          title: "Extend command palette #18",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162983412-baa7de1f-60a3-4554-bd08-1774cfd1d646.png" }],
        },
        {
          title: "Add Page: Admin dashboard with indicators #23",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162983569-bd1f8979-0f4b-4928-812d-c6dd23f8a185.png" }],
        },
        {
          title: "Tenant with their own alias instead of cuid on the URL #24",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162983928-0cae787f-dc8e-4701-bf2f-a51dd7c4b0e4.png" }],
        },
        {
          title: "Add user activity logs #27",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162984096-5272af36-af99-4cd9-8117-e36d9772f7a6.png" }],
        },
        {
          title: "Modify Subscriptions on Tenants as Admin #30",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162986904-5e3a9679-2795-4206-8a5e-7c9d5353c401.png" }],
        },
      ],
    },
    {
      date: "April 4, 2022",
      title: "Vercel deployment + i18n",
      description: "Demo deployed on Vercel, and added Locale Selector, Page Loading component and more.",
      url: "https://dev.to/alexandromtzg/remix-saas-kit-changelog-1-34b6",
      added: [
        {
          title: "Upgrade to React 18 #6",
        },
        {
          title: "Make fewer database calls #7",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161167627-1e8c2407-fea2-4bb4-81d5-2542f7a02ac4.png" }],
        },
        {
          title: "Add Component: GDPR cookie consent page and banner #9",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161302746-cb149b4e-7f67-46d7-8a46-7c4459a76bf9.png" }],
        },
        {
          title: "Add Module: Workflows with Custom Forms and Custom Fields #11",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161357823-5337a976-0b8a-4a88-8ca9-b6a8f3a85299.png" }],
        },
        {
          title: "Add Page: Blog #12",
        },
        {
          title: "Remove TenantSelector and WorkspaceSelector and have {tenantId}/{workspaceId} on the URL #13",
        },
        {
          title: "Add Page: Roles and User roles #14",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161438663-3805ef3e-3182-4c9f-a279-6d6912e2b6f7.png" }],
        },
        {
          title: "Add Page: Object-level permissions (Create, Read, Update, Delete) #15",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161438749-653823cb-665d-4ba4-8c0d-9fc0d72f4ebf.png" }],
        },
        {
          title: "Remove Postmark hard-coded dependency #16",
        },
      ],
      closed: [
        {
          title: "Vercel deployment not translating with remix-i18next #1",
        },
        {
          title: "Implement a global loading component #2",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161410326-183120dc-7d6a-415f-9b53-c59c0ad76971.png" }],
        },
        {
          title: "Display Stripe invoices #3",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161415542-0080c4ab-66ad-4647-80d7-9e6c1cf87c6d.png" }],
        },
        {
          title: "Add a locale dropdown #4",
          video: "https://www.loom.com/share/1a89140e7b93481bab3cc94b8bb34a57?t=0",
        },
        {
          title: "Mobile site not responsive #5",
        },
        {
          title: "Translate meta titles #10",
        },
        {
          title: "Add /admin/tenants table columns: Workspace, User and Contracts count, Plan, and Revenue #17",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161452641-26edcfb0-1ac0-4d72-9de4-339fad73c9ec.png" }],
        },
      ],
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
                                  <a className="text-gray-500" href={`https://github.com/AlexandroMtzG/remix-saas-kit/releases/tag/${item.releaseTag}`}>
                                    v{item.releaseTag}
                                  </a>
                                </span>
                              )}
                            </time>
                            <h2 id={UrlUtils.slugify(item.date, 0)} className="text-black dark:text-white w-full">
                              {item.title}
                            </h2>
                            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{item.description}</p>
                            <ChangelogIssues title="Closed issues" items={item.closed} icon="✅" />
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

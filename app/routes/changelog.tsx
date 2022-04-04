import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { useTranslation } from "react-i18next";
import { i18nHelper } from "~/locale/i18n.utils";
import ChangelogIssues, { ChangelogItem } from "~/components/front/ChangelogIssues";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  items: ChangelogItem[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);

  const changelogItems: ChangelogItem[] = [
    {
      date: new Date(2022, 3, 4),
      added: [
        {
          title: "Upgrade to React 18 #6",
        },
        {
          title: "Make less database calls #7",
          img: "https://user-images.githubusercontent.com/8606530/161167627-1e8c2407-fea2-4bb4-81d5-2542f7a02ac4.png",
        },
        {
          title: "Add Component: GDPR cookie consent page and banner #9",
          img: "https://user-images.githubusercontent.com/8606530/161302746-cb149b4e-7f67-46d7-8a46-7c4459a76bf9.png",
        },
        {
          title: "Add Module: Workflows with Custom Forms and Custom Fields #11",
          img: "https://user-images.githubusercontent.com/8606530/161357823-5337a976-0b8a-4a88-8ca9-b6a8f3a85299.png",
        },
        {
          title: "Add Page: Blog #12",
        },
        {
          title: "Remove TenantSelector and WorkspaceSelector and have {tenantId}/{workspaceId} on the URL #13",
        },
        {
          title: "Add Page: Roles and User roles #14",
          img: "https://user-images.githubusercontent.com/8606530/161438663-3805ef3e-3182-4c9f-a279-6d6912e2b6f7.png",
        },
        {
          title: "Add Page: Object-level permissions (Create, Read, Update, Delete) #15",
          img: "https://user-images.githubusercontent.com/8606530/161438749-653823cb-665d-4ba4-8c0d-9fc0d72f4ebf.png",
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
          img: "https://user-images.githubusercontent.com/8606530/161410326-183120dc-7d6a-415f-9b53-c59c0ad76971.png",
        },
        {
          title: "Display Stripe invoices #3",
          img: "https://user-images.githubusercontent.com/8606530/161415542-0080c4ab-66ad-4647-80d7-9e6c1cf87c6d.png",
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
          img: "https://user-images.githubusercontent.com/8606530/161452641-26edcfb0-1ac0-4d72-9de4-339fad73c9ec.png",
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
  title: data.title,
});

export default function ContactRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <div>
        <Header />
        <div className="bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:flex-col sm:align-center">
              <div className="relative max-w-xl mx-auto py-12 sm:py-6 w-full overflow-hidden px-2">
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
                  <p className="mt-4 text-lg leading-6 text-gray-500">{t("front.changelog.headline")}</p>
                </div>
                <div className="mt-12 mx-auto ">
                  <div className="prose text-sm text-black dark:text-white">
                    {data.items.map((item) => {
                      return (
                        <>
                          <h2 className="text-black dark:text-white">{DateUtils.dateMonthDayYear(item.date)}</h2>
                          <ChangelogIssues title="Added issues" items={item.added} icon="⌛" />
                          <ChangelogIssues title="Closed issues" items={item.closed} icon="✅" />
                        </>
                      );
                    })}
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

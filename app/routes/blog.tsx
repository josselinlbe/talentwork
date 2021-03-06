import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import PostsList from "~/components/blog/PostsList";
import { useTranslation } from "react-i18next";
import { BlogPostWithDetails, getAllBlogPosts } from "~/utils/db/blog.db.server";
import { Language } from "remix-i18next";

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
  posts: BlogPostWithDetails[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);

  const posts = await getAllBlogPosts(true);

  const data: LoaderData = {
    title: `${t("front.navbar.blog")} | ${process.env.APP_NAME}`,
    i18n: translations,
    posts,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function BlogRoute() {
  const { t } = useTranslation();
  const { posts } = useLoaderData<LoaderData>();

  return (
    <div>
      <div>
        <Header />
        <div className="bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto py-12 sm:py-6">
            <div className="sm:flex sm:flex-col sm:align-center">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t("blog.title")}</h1>
                <p className="mt-4 text-lg leading-6 text-gray-600 dark:text-gray-400">{t("blog.headline")}</p>
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
              <div className="px-4">
                <PostsList items={posts} withCoverImage={true} />
              </div>
            </div>
          </div>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
}

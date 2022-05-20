import { useTranslation } from "react-i18next";
import { i18nHelper } from "~/locale/i18n.utils";
import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useLoaderData, useSubmit } from "remix";
import { marked } from "marked";
import DateUtils from "~/utils/shared/DateUtils";
import { BlogPostWithDetails, getBlogPost, updateBlogPostPublished } from "~/utils/db/blog.db.server";
import { getUserInfo } from "~/utils/session.server";
import { getUser } from "~/utils/db/users.db.server";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { useRef } from "react";
import PostTags from "~/components/blog/PostTags";
import { Language } from "remix-i18next";

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
  post: BlogPostWithDetails;
  markdown: string;
  canEdit: boolean;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  let { t, translations } = await i18nHelper(request);

  const post = await getBlogPost(params.slug ?? "");

  if (!post) {
    return redirect("/404");
  }

  if (!post.published && (!user || !user.admin)) {
    return redirect("/404");
  }

  const data: LoaderData = {
    title: `${post.title} | ${t("front.navbar.blog")} | ${process.env.APP_NAME}`, // Optional
    i18n: translations, // Required if you want to translate
    post,
    markdown: marked(post.content),
    canEdit: user?.admin !== undefined,
  };
  return json(data);
};

export type BlogPostActionData = {
  error?: string;
  createdPost?: BlogPostWithDetails | null;
};
const badRequest = (data: BlogPostActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "publish") {
    const post = await getBlogPost(params.slug ?? "");
    if (post) {
      await updateBlogPostPublished(post.id ?? "", true);
      return redirect("/blog/" + post.slug);
    }
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export const meta: MetaFunction = ({ data }) => {
  const { post } = data as LoaderData;

  return {
    title: data.title,
    description: post.description,
    "og:image": post.image,
    keyworkds: post.tags.map((postTag) => postTag.tag.name).join(","),
  };
};

export default function BlogPostRoute() {
  const { t } = useTranslation();
  const { post, markdown, canEdit } = useLoaderData<LoaderData>();
  const submit = useSubmit();

  const confirmModal = useRef<RefConfirmModal>(null);

  function publish() {
    confirmModal.current?.show(t("blog.publish"));
  }

  function confirmedPublish() {
    const form = new FormData();
    form.set("action", "publish");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      <Header />
      <div className="py-12 sm:py-6 relative bg-white dark:bg-gray-900 overflow-hidden">
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full">
          <div className="relative h-full text-lg max-w-prose mx-auto" aria-hidden="true">
            <svg className="absolute top-12 left-full transform translate-x-32" width={404} height={384} fill="none" viewBox="0 0 404 384">
              <defs>
                <pattern id="74b3fd99-0a6f-4271-bef2-e80eeafdf357" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
                  <rect x={0} y={0} width={4} height={4} className="text-gray-200 dark:text-gray-800" fill="currentColor" />
                </pattern>
              </defs>
              <rect width={404} height={384} fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)" />
            </svg>
            <svg className="absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32" width={404} height={384} fill="none" viewBox="0 0 404 384">
              <defs>
                <pattern id="f210dbf6-a58d-4871-961e-36d5016a0f49" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
                  <rect x={0} y={0} width={4} height={4} className="text-gray-200 dark:text-gray-800" fill="currentColor" />
                </pattern>
              </defs>
              <rect width={404} height={384} fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
            </svg>
            <svg className="absolute bottom-12 left-full transform translate-x-32" width={404} height={384} fill="none" viewBox="0 0 404 384">
              <defs>
                <pattern id="d3eb07ae-5182-43e6-857d-35c643af9034" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
                  <rect x={0} y={0} width={4} height={4} className="text-gray-200 dark:text-gray-800" fill="currentColor" />
                </pattern>
              </defs>
              <rect width={404} height={384} fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)" />
            </svg>
          </div>
        </div>
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            {canEdit && (
              <div className=" shadow-xl mb-10">
                <div className="bg-accent-50 rounded-md border border-gray-300">
                  <div className="max-w-7xl mx-auto py-3 px-3 sm:pl-6 lg:pl-8">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="flex p-1 rounded-lg bg-accent-800">
                          {/* <SpeakerphoneIcon className="h-6 w-6 text-white" aria-hidden="true" /> */}
                        </span>
                        <p className="ml-3 font-medium text-accent-800 truncate">{post.published ? t("blog.published") : t("blog.thisIsADraft")}</p>
                      </div>
                      <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto flex space-x-2">
                        <ButtonSecondary to={"/admin/blog/" + post.id}>{t("shared.edit")}</ButtonSecondary>
                        {!post.published && (
                          <ButtonPrimary disabled={post.published} onClick={publish}>
                            {t("blog.publish")}
                          </ButtonPrimary>
                        )}
                      </div>
                      <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                        <button
                          type="button"
                          className="-mr-1 flex p-2 rounded-md hover:bg-accent-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
                        >
                          <span className="sr-only">Dismiss</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div>
              <span className=" flex items-center space-x-1 text-base text-center tracking-wide justify-center text-gray-500">
                {/* <span className="text-indigo-600 font-semibold uppercase">{post.category.name}</span> */}
                {/* <span>-</span> */}
                <span className=" text-gray-500">{DateUtils.dateMonthDayYear(post.date)}</span>
              </span>
              <h1 className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {post.title}
              </h1>
            </div>

            <dl className="pt-6 xl:pt-11">
              <dd>
                <ul className="flex justify-center xl:block space-x-8 sm:space-x-12 xl:space-x-0 xl:space-y-8">
                  <li className="flex items-center space-x-2">
                    <img src={post.author.image} alt="" className="w-10 h-10 rounded-full" />
                    <dl className="text-sm font-medium leading-5 whitespace-no-wrap">
                      <dt className="sr-only">{t("shared.name")}</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {post.author.firstName} {post.author.lastName}{" "}
                        <a href={post.author.url} target="_blank" rel="noreferrer" className="text-purple-500 hover:text-purple-600">
                          @{post.author.slug}
                        </a>
                      </dd>
                      <PostTags items={post.tags} />
                    </dl>
                  </li>
                </ul>
              </dd>
            </dl>
            {/* <p className="mt-8 text-xl text-gray-500 leading-8">{post.description}</p> */}
          </div>
          <div className="mt-6 prose dark:prose-dark prose-indigo prose-lg mx-auto space-y-6 max-w-2xl">
            {post.image && <img className="border border-gray-300 dark:border-gray-800 rounded-lg shadow-lg" src={post.image} alt={post.title} />}
            <div dangerouslySetInnerHTML={{ __html: markdown }} />
          </div>
        </div>
      </div>
      <ConfirmModal ref={confirmModal} onYes={confirmedPublish} />
      <Footer />
    </div>
  );
}

import { BlogAuthor, BlogCategory, BlogTag } from "@prisma/client";
import { t } from "i18next";
import { marked } from "marked";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, redirect, useActionData, useLoaderData, useNavigate, useParams } from "remix";
import PostForm from "~/components/blog/PostForm";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import {
  BlogPostWithDetails,
  createBlogPost,
  deleteBlogPost,
  getAllAuthors,
  getAllBlogPosts,
  getAllCategories,
  getAllTags,
  getBlogPost,
  updateBlogPost,
} from "~/utils/db/blog.db.server";

type LoaderData = {
  item: BlogPostWithDetails;
  authors: BlogAuthor[];
  categories: BlogCategory[];
  tags: BlogTag[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const item = await getBlogPost(params.id ?? "");
  if (!item) {
    return redirect("/admin/blog");
  }

  const data: LoaderData = {
    item,
    authors: await getAllAuthors(),
    categories: await getAllCategories(),
    tags: await getAllTags(),
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
  const type = form.get("type")?.toString() ?? "";
  const content = form.get("content")?.toString() ?? "";
  if (type === "edit") {
    const title = form.get("title")?.toString() ?? "";
    const slug = form.get("slug")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const date = form.get("date")?.toString() ?? "";
    const image = form.get("image")?.toString() ?? "";
    const markdown = marked(content);
    const published = Boolean(form.get("published"));
    const readingTime = form.get("reading-time")?.toString() ?? "";
    const authorId = form.get("author")?.toString() ?? "";
    const categoryId = form.get("category")?.toString() ?? "";
    const tags = form.get("tags")?.toString() ?? "";

    try {
      await updateBlogPost(params.id ?? "", {
        slug,
        title,
        description,
        date: new Date(date),
        image,
        content: markdown,
        readingTime,
        published,
        authorId,
        categoryId,
        tagNames: tags.split(",").filter((f) => f.trim() != ""),
      });

      return redirect("/blog/" + slug);
    } catch (e) {
      return badRequest({ error: JSON.stringify(e) });
    }
  } else if (type === "delete") {
    try {
      await deleteBlogPost(params.id ?? "");
      return redirect("/admin/blog");
    } catch (e) {
      return badRequest({ error: JSON.stringify(e) });
    }
  } else {
    return badRequest(t("shared.invalidForm"));
  }
};

export default function NewBlog() {
  const { t } = useTranslation();
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <Breadcrumb
        className="w-full"
        home="/admin/dashboard"
        menu={[
          { title: t("blog.title"), routePath: "/admin/blog" },
          { title: t("blog.edit"), routePath: "/admin/blog/" + params.id },
        ]}
      />
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("blog.edit")}</h1>
        </div>
      </div>
      <div className="pt-6 space-y-2 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <PostForm item={data.item} authors={data.authors} categories={data.categories} tags={data.tags} />
      </div>
    </div>
  );
}

import { BlogAuthor, BlogCategory, BlogTag } from "@prisma/client";
import { marked } from "marked";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import PostForm from "~/components/blog/PostForm";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { BlogPostWithDetails, deleteBlogPost, getAllAuthors, getAllCategories, getAllTags, getBlogPost, updateBlogPost } from "~/utils/db/blog.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

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
  const action = form.get("action")?.toString() ?? "";
  const content = form.get("content")?.toString() ?? "";
  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.blog.update");
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
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.blog.delete");
    try {
      await deleteBlogPost(params.id ?? "");
      return redirect("/admin/blog");
    } catch (e) {
      return badRequest({ error: JSON.stringify(e) });
    }
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function NewBlog() {
  const { t } = useTranslation();
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
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
      <div className="py-6 space-y-2 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <PostForm
          item={data.item}
          authors={data.authors}
          categories={data.categories}
          tags={data.tags}
          canUpdate={adminData.permissions.includes("admin.blog.update")}
          canDelete={adminData.permissions.includes("admin.blog.delete")}
        />
      </div>
    </div>
  );
}

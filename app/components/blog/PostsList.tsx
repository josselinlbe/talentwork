import clsx from "clsx";
import { Link } from "@remix-run/react";
import { BlogPostWithDetails } from "~/utils/db/blog.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: BlogPostWithDetails[];
}

export default function PostsList({ items }: Props) {
  return (
    <div
      className={clsx(
        "mt-12 mx-auto grid gap-5 max-w-lg",
        items.length === 1 && "lg:grid-cols-1 max-w-md",
        items.length === 2 && "lg:grid-cols-2 max-w-4xl",
        items.length > 2 && "lg:grid-cols-3 lg:max-w-none"
      )}
    >
      {items.map((post) => (
        <div key={post.title} className="flex flex-col rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
          <Link to={"/blog/" + post.slug} className="flex-shrink-0">
            <img className={clsx("h-48 w-full", items.length <= 2 && "object-contain", items.length > 2 && "object-cover")} src={post.image} alt="" />
          </Link>
          <div className="flex-1 bg-white dark:bg-gray-900 p-6 flex flex-col justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-accent-600 dark:text-accent-400">
                <a href={post.category.name} className="hover:underline">
                  {post.category.name}
                </a>
              </p>
              <a href={"/blog/" + post.slug} className="block mt-2">
                <p className="text-xl font-semibold ">{post.title}</p>
                <p className="mt-3 text-base text-gray-500">{post.description}</p>
              </a>
            </div>
            <div className="mt-6 flex items-center">
              <div className="flex-shrink-0">
                <a href={post.author.slug}>
                  <span className="sr-only">
                    {post.author.firstName} {post.author.lastName}
                  </span>
                  <img className="h-10 w-10 rounded-full" src={post.author.image} alt="" />
                </a>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium ">
                  <a href={post.author.slug} className="hover:underline">
                    {post.author.firstName} {post.author.lastName}
                  </a>
                </p>
                <div className="flex space-x-1 text-sm text-gray-500">
                  <time dateTime={DateUtils.dateYMD(post.date)}>{DateUtils.dateYMD(post.date)}</time>
                  {post.readingTime && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>{post.readingTime} read</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

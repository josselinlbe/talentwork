import { useTranslation } from "react-i18next";
import { Link } from "remix";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: any[];
}

export default function PostsList({ items }: Props) {
  const { t } = useTranslation();
  return (
    <div className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
      <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
        <div>
          <h2 className="text-3xl tracking-tight font-extrabold sm:text-4xl">{t("regions.posts.title")}</h2>
          <div className="mt-3 sm:mt-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:items-center">
            <p className="text-xl text-gray-500">{t("regions.posts.headline")}.</p>
          </div>
        </div>
        <div className="mt-6 pt-10 grid gap-16 lg:gap-x-5 lg:gap-y-12">
          {items.map((post) => (
            <div key={post.title}>
              <p className="text-sm text-gray-500">
                <time>{DateUtils.dateYMD(post.date)}</time>
              </p>
              <Link to={post.slug} className="mt-2 block">
                <p className="text-xl font-semibold">{post.title}</p>
                <p className="mt-3 text-base text-gray-500">{post.description}</p>
                {post.image.length > 0 && <img className="mt-2 rounded-md shadow-lg border border-gray-300" alt={post.title} src={post.image} />}

                <p>{t("shared.readMore")} &rarr;</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

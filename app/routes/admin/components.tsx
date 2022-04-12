import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction } from "remix";
import AllComponentsList from "~/components/ui/AllComponentsList";
import { i18nHelper } from "~/locale/i18n.utils";

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);
  return json({
    title: `${t("admin.components.title")} | ${process.env.APP_NAME}`,
  });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminComponentsRoute() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("admin.components.title")}</h1>
        </div>
      </div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        <AllComponentsList withSlideOvers={true} />
      </div>
    </div>
  );
}

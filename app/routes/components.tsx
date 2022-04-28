import type { LoaderFunction, MetaFunction } from "remix";
import { json } from "remix";
import { useTranslation } from "react-i18next";
import { i18nHelper } from "~/locale/i18n.utils";
import AllComponentsList from "~/components/ui/AllComponentsList";
import SidebarNavigation from "~/components/layouts/sidebar/SidebarNavigation";
import { Language } from "remix-i18next";

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("admin.components.title")} | ${process.env.APP_NAME}`,
    i18n: translations,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function ComponentsRoute() {
  return (
    <div className="bg-white">
      <SidebarNavigation>
        <div className="">
          <AllComponentsList />
        </div>
      </SidebarNavigation>
    </div>
  );
}

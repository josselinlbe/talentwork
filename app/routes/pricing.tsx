import Header from "~/components/front/Header";
import Plans from "~/components/core/settings/subscription/Plans";
import Footer from "~/components/front/Footer";
import { useTranslation } from "react-i18next";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { LoaderFunction, json, useLoaderData, MetaFunction } from "remix";
import { i18n } from "~/locale/i18n.server";
import { Language } from "remix-i18next";
import plans from "~/application/pricing/plans.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
  items: SubscriptionProductDto[];
};
export let loader: LoaderFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");
  // await new Promise((r) => setTimeout(r, 1000));
  const items = await getAllSubscriptionProducts();
  const data: LoaderData = {
    title: `${t("front.pricing.title")} | ${process.env.APP_NAME}`,
    i18n: await i18n.getTranslations(request, ["translations"]),
    items: items.length > 0 ? items : plans,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function PricingRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  return (
    <div>
      <div>
        <Header />
        <div className="bg-white dark:bg-gray-900 pt-6 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t("front.pricing.title")}</h1>
              <p className="mt-4 text-lg leading-6 text-gray-500">{t("front.pricing.headline")}</p>
            </div>
            {data?.items && <Plans items={data.items} />}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

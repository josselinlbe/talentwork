import Footer from "~/components/front/Footer";
import Hero from "~/components/front/Hero";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserInfo, UserSession } from "~/utils/session.server";
import { json, LoaderFunction, MetaFunction } from "remix";
import { getUser } from "~/utils/db/users.db.server";
import TopBanner from "~/components/ui/banners/TopBanner";
import LogoClouds from "~/components/ui/images/LogoClouds";
import { Language } from "remix-i18next";
import FeatureImages from "~/components/front/FeatureImages";
import Features from "~/components/front/Features";
import Pricing from "~/components/front/Pricing";

export type IndexLoaderData = {
  title: string;
  userSession: UserSession;
  authenticated: boolean;
  isAdmin: boolean;
  i18n: Record<string, Language>;
};

export let loader: LoaderFunction = async ({ request }) => {
  const { translations } = await i18nHelper(request);
  try {
    const userSession = await getUserInfo(request);
    const user = await getUser(userSession.userId);
    const data: IndexLoaderData = {
      title: `${process.env.APP_NAME}`,
      userSession,
      isAdmin: user?.admin !== null,
      authenticated: userSession.userId?.length > 0,
      i18n: translations,
    };
    return json(data);
  } catch (e) {
    return json({
      i18n: translations,
    });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function IndexRoute() {
  return (
    <div>
      <TopBanner />
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-slate-200 space-y-16">
        <Hero />
        <LogoClouds />
        <Features />
        <FeatureImages />
        <Pricing />
        {/* <JoinNow className="relative z-20" /> */}
        <Footer />
      </div>
    </div>
  );
}

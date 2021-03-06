import Footer from "~/components/front/Footer";
import Hero from "~/components/front/Hero";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserInfo, UserSession } from "~/utils/session.server";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser } from "~/utils/db/users.db.server";
import TopBanner from "~/components/ui/banners/TopBanner";
import { Language } from "remix-i18next";
import FeatureImages from "~/components/front/FeatureImages";
import Features from "~/components/front/Features";
import { useTranslation } from "react-i18next";
import Testimonials from "~/components/front/Testimonials";
import { TestimonialDto } from "~/application/dtos/marketing/TestimonialDto";
import { getTestimonials } from "~/utils/services/marketingService";
import Newsletter from "~/components/front/Newsletter";
import { useRootData } from "~/utils/data/useRootData";
import { useEffect } from "react";
import VideoDemo from "~/components/front/VideoDemo";
import LogoClouds from "~/components/ui/images/LogoClouds";

export type IndexLoaderData = {
  title: string;
  userSession: UserSession;
  authenticated: boolean;
  isAdmin: boolean;
  i18n: Record<string, Language>;
  testimonials: TestimonialDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  const { translations } = await i18nHelper(request);
  try {
    const testimonials = getTestimonials();

    const userSession = await getUserInfo(request);
    const user = await getUser(userSession.userId);
    const data: IndexLoaderData = {
      title: `${process.env.APP_NAME}`,
      userSession,
      isAdmin: user?.admin !== null,
      authenticated: userSession.userId?.length > 0,
      i18n: translations,
      testimonials,
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
  const { t } = useTranslation();
  const data = useLoaderData<IndexLoaderData>();
  const { chatWebsiteId } = useRootData();

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp.push(["do", "chat:show"]);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div>
      {chatWebsiteId && (
        <div
          dangerouslySetInnerHTML={{
            __html: `<script type="text/javascript">window.$crisp=[];window.CRISP_WEBSITE_ID="${chatWebsiteId}";(function(){d = document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();</script>`,
          }}
        ></div>
      )}

      <TopBanner
        message={t("front.hero.prelaunch")}
        cta={{
          message: t("front.hero.cta"),
          link: "https://alexandromg.gumroad.com/l/Talentwork",
        }}
      />
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-slate-200 space-y-16">
        <Hero />
        <LogoClouds />
        <FeatureImages />
        <VideoDemo
          title="An overview of Talentwork ????"
          url="https://www.loom.com/embed/bf16cf17fee64e8ca1d32fc73e0652d5"
          subtitle="Lorem..."
        />
        <Testimonials items={data?.testimonials} />
        <Features />
        <Newsletter />
        <Footer />
      </div>
    </div>
  );
}

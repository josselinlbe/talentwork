import Footer from "~/components/front/Footer";
import Hero from "~/components/front/Hero";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserInfo, UserSession } from "~/utils/session.server";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser } from "~/utils/db/users.db.server";
import TopBanner from "~/components/ui/banners/TopBanner";
import LogoClouds from "~/components/ui/images/LogoClouds";
import { Language } from "remix-i18next";
import FeatureImages from "~/components/front/FeatureImages";
import Features from "~/components/front/Features";
import PricingCTA from "~/components/front/PricingCTA";
import { useTranslation } from "react-i18next";
import { getGitHubSocialProof } from "~/utils/integrations/githubService";
import UpcomingFeatures from "~/components/front/UpcomingFeatures";
import Testimonials from "~/components/front/Testimonials";
import { TestimonialDto } from "~/application/dtos/marketing/TestimonialDto";
import { getTestimonials } from "~/utils/services/marketingService";
import Newsletter from "~/components/front/Newsletter";
import { useRootData } from "~/utils/data/useRootData";
import { useEffect } from "react";
import Community from "~/components/front/Community";
import VideoDemo from "~/components/front/VideoDemo";

export type IndexLoaderData = {
  title: string;
  userSession: UserSession;
  authenticated: boolean;
  isAdmin: boolean;
  i18n: Record<string, Language>;
  socialProof: any;
  testimonials: TestimonialDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  const { translations } = await i18nHelper(request);
  try {
    const socialProof = await getGitHubSocialProof();
    const testimonials = getTestimonials();

    const userSession = await getUserInfo(request);
    const user = await getUser(userSession.userId);
    const data: IndexLoaderData = {
      title: `${process.env.APP_NAME}`,
      userSession,
      isAdmin: user?.admin !== null,
      authenticated: userSession.userId?.length > 0,
      i18n: translations,
      socialProof,
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
          link: "https://alexandromg.gumroad.com/l/SaasRock",
        }}
      />
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-slate-200 space-y-16">
        <Hero />
        <LogoClouds />
        <FeatureImages />
        <Community
          title="The SaasRock Community"
          subtitle="We're all looking to build successful SaaS applications."
          socialProof={data.socialProof}
          cta={[
            {
              message: "Subscribe",
              link: "https://alexandromg.gumroad.com/l/SaasRock",
            },
            {
              message: "Join Discord",
              link: "https://discord.gg/KMkjU2BFn9",
            },
            {
              message: "Youtube channel",
              link: "https://www.youtube.com/channel/UCdXy3FPDHxP-b7NhPspt6cQ",
            },
          ]}
        />
        {/* <VideoDemo
          title="Building a SaaS with SaasRock 🎥"
          url="https://www.youtube.com/embed/FyQvTxyl7LI"
          subtitle="Follow this tutorial while you build your SaaS with SaasRock."
        /> */}
        <Testimonials items={data?.testimonials} socialProof={data?.socialProof} />
        <Features />
        <PricingCTA />
        <UpcomingFeatures />
        <Newsletter />
        <Footer />
      </div>
    </div>
  );
}

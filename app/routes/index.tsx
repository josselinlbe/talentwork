import Features from "~/components/front/Features";
import Footer from "~/components/front/Footer";
import Hero from "~/components/front/Hero";
import JoinNow from "~/components/front/JoinNow";
import { json, LoaderFunction, MetaFunction, useCatch, useLoaderData } from "remix";
import { i18n } from "~/locale/i18n.server";
import { Language } from "remix-i18next";
import { getUserInfo } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "Remix SaasFrontend",
});

type LoaderData = {
  authenticated: boolean;
  i18n: Record<string, Language>;
};

export let loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const data: LoaderData = {
    authenticated: (userInfo?.userId ?? "").length > 0,
    i18n: await i18n.getTranslations(request, ["translations"]),
  };
  return json(data);
};

export default function IndexRoute() {
  return (
    <div>
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-slate-200">
        <Hero />
        <Features className="relative z-10" />
        <JoinNow />
        <Footer />
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <div className="error-container">
      <h1>{`${caught.status} ${caught.statusText}`}</h1>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="error-container">
      <h1>App Error</h1>
      <pre>{JSON.stringify(error)}</pre>
    </div>
  );
}

import Features from "~/components/front/Features";
import Footer from "~/components/front/Footer";
import Hero from "~/components/front/Hero";
import JoinNow from "~/components/front/JoinNow";
import { i18n } from "~/locale/i18n.server";
import { Language } from "remix-i18next";
import { getUserInfo } from "~/utils/session.server";
import { MetaFunction, LoaderFunction, json, useCatch } from "remix";
import { getUser } from "~/utils/db/users.db.server";
import { UserType } from "~/application/enums/users/UserType";

type LoaderData = {
  title: string;
  authenticated: boolean;
  userType: UserType;
  i18n: Record<string, Language>;
};

export let loader: LoaderFunction = async ({ request }) => {
  try {
    const userInfo = await getUserInfo(request);
    const user = await getUser(userInfo.userId);
    const data: LoaderData = {
      title: `${process.env.APP_NAME}`,
      authenticated: (userInfo?.userId ?? "").length > 0,
      userType: user?.type ?? UserType.Tenant,
      i18n: await i18n.getTranslations(request, ["translations"]),
    };
    return json(data);
  } catch (e) {
    console.error({
      error: e,
    });
    return json({
      i18n: await i18n.getTranslations(request, ["translations"]),
    });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

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
    <div>
      <h1>{`${caught.status} ${caught.statusText}`}</h1>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>Index Error</h1>
      <pre>{JSON.stringify(error)}</pre>
    </div>
  );
}

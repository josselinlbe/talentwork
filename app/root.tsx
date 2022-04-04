import {
  LiveReload,
  Outlet,
  LinksFunction,
  Links,
  useCatch,
  MetaFunction,
  Meta,
  Scripts,
  ScrollRestoration,
  LoaderFunction,
  useLoaderData,
  ActionFunction,
} from "remix";
import styles from "./styles/app.css";
import { useSetupTranslations } from "remix-i18next";
import { createUserSession, getUserInfo } from "./utils/session.server";
import { loadRootData, useRootData } from "./utils/data/useRootData";
import TopBanner from "./components/ui/banners/TopBanner";
import FloatingLoader from "./components/ui/loaders/FloatingLoader";
import Page404 from "./components/pages/404";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export let loader: LoaderFunction = async ({ request }) => {
  return loadRootData(request);
};

export const meta: MetaFunction = ({ data }) => {
  const description = `Remix SaaS kit with everything you need to start your SaaS app.`;
  return {
    charset: "utf-8",
    title: data?.title,
    description,
    keywords: "Remix,saas,tailwindcss,typescript,starter",
    "og:title": "Remix SaaS kit",
    "og:type": "website",
    "og:url": "https://remix.saasfrontends.com",
    "og:image": "https://yahooder.sirv.com/saasfrontends/remix/ss/cover.png",
    "og:card": "summary_large_image",
    "og:creator": "@AlexandroMtzG",
    "og:site": "https://saasfrontends.com",
    "og:description": description,
    "twitter:image": "https://yahooder.sirv.com/saasfrontends/remix/remix-thumbnail.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@AlexandroMtzG",
    "twitter:site": "@SaasFrontends",
    "twitter:title": "Remix SaaS kit",
    "twitter:description": description,
  };
};

function Document({ children }: { children: React.ReactNode; title?: string }) {
  let data = useRootData();
  return (
    <html lang={data?.lng ?? "en"} className={data?.lightOrDarkMode === "dark" ? "dark" : ""}>
      <head>
        <Meta />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Links />
      </head>
      <body className="min-h-screen text-gray-800 dark:text-white bg-white dark:bg-slate-900 max-w-full max-h-full">
        <TopBanner />

        {children}
        <Scripts />
        <LiveReload />
        <ScrollRestoration />
        <FloatingLoader />

        <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
        <noscript>
          <img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="privacy-friendly-simpleanalytics" referrerPolicy="no-referrer-when-downgrade" />
        </noscript>
      </body>
    </html>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const type = form.get("type");
  const redirect = form.get("redirect")?.toString();
  if (type === "toggleLightOrDarkMode") {
    const current = userInfo?.lightOrDarkMode ?? "dark";
    const lightOrDarkMode = current === "dark" ? "light" : "dark";
    return createUserSession(
      {
        userId: userInfo?.userId ?? "",
        currentTenantId: userInfo?.currentTenantId ?? "",
        currentWorkspaceId: userInfo?.currentWorkspaceId ?? "",
        lng: userInfo?.lng ?? "en",
        lightOrDarkMode,
      },
      redirect
    );
  }
  if (type === "setLocale") {
    const lng = form.get("lng")?.toString() ?? "";
    return createUserSession(
      {
        userId: userInfo?.userId,
        currentTenantId: userInfo?.currentTenantId,
        currentWorkspaceId: userInfo?.currentWorkspaceId,
        lightOrDarkMode: userInfo?.lightOrDarkMode,
        lng,
      },
      redirect
    );
  }
};

export default function App() {
  let { lng } = useLoaderData<{ lng: string }>();
  useSetupTranslations(lng ?? "en");
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div>
        <h1>
          {caught.status === 404 ? (
            <Page404 />
          ) : (
            <div className="mx-auto p-12 text-center">
              {caught.status} {caught.statusText}
            </div>
          )}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Uh-oh!">
      <div className="mx-auto p-12 text-center">
        <h1>
          Server error ({error.message}),{" "}
          <button type="button" onClick={() => window.location.reload()} className="underline">
            please try again
          </button>
        </h1>
      </div>
    </Document>
  );
}

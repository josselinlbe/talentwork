import { json, LoaderFunction, Outlet, useLoaderData } from "remix";
import { Language } from "remix-i18next";
import AppLayout from "~/components/app/AppLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import styles from "highlight.js/styles/night-owl.css";
import { Command } from "~/application/dtos/layout/Command";
import { getDocCommands } from "~/utils/services/docsService";

export const links = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
  commands: Command[];
};
export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);

  const commands = await getDocCommands();

  const data: LoaderData = {
    title: `${t("docs.title")} | ${process.env.APP_NAME}`,
    i18n: translations,
    commands,
  };
  return json(data);
};

export default function DocsRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <AppLayout layout="docs" commands={data.commands}>
      <div className="py-4 px-10 w-full col-span-2">
        <div className="prose prose-emerald">
          <Outlet />
        </div>
      </div>
    </AppLayout>
  );
}

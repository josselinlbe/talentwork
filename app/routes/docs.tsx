import { json, LoaderFunction, Outlet, useLoaderData } from "remix";
import { Language } from "remix-i18next";
import AppLayout from "~/components/app/AppLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import styles from "highlight.js/styles/night-owl.css";
import { Command } from "~/application/dtos/layout/Command";
import { DocsSidebar } from "~/application/sidebar/DocsSidebar";

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

  const commands: Command[] = [];

  DocsSidebar.forEach((doc, idx) => {
    const command: Command = {
      command: (idx + 1).toString(),
      title: doc.title,
      description: doc.description ?? "",
      toPath: "",
      items: [],
    };
    if (doc.items !== undefined && doc.items?.length > 0) {
      doc.items.forEach((item) => {
        command.items?.push({
          command: (idx + 1).toString(),
          title: item.title,
          description: item.description ?? "",
          toPath: item.path,
        });
      });
    } else {
      command.toPath = doc.path;
    }
    commands.push(command);
  });

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
          <h1>WORK IN PROGRESS</h1>
          <Outlet />
        </div>
      </div>
    </AppLayout>
  );
}

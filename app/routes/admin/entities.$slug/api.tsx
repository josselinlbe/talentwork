import { marked } from "marked";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  entity: EntityWithDetails;
  serverUrl: string;
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const data: LoaderData = {
    entity,
    serverUrl: process.env.SERVER_URL?.toString() ?? "",
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  return badRequest({ error: t("shared.invalidForm") });
};

export default function EditEntityIndexRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  return (
    <div className="space-y-2">
      <div className="font-bold">API Docs: UNDER CONSTRUCTION</div>
      <div className="prose">
        <div className="flex space-x-2 items-center text-sm font-bold">
          <SimpleBadge title="GET" color={Colors.BLUE} />
          <div>{"Get All " + t(data.entity.titlePlural)}</div>
        </div>
        <div
          className="-mt-3"
          dangerouslySetInnerHTML={{
            __html: marked(`
  ${"```shell"}
  curl ${data.serverUrl}/api/${data.entity.slug} \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -G
  ${"```"}`),
          }}
        />

        <div className="flex space-x-2 items-center text-sm font-bold">
          <SimpleBadge title="GET" color={Colors.BLUE} />
          <div>{"Get " + t(data.entity.title)}</div>
        </div>
        <div
          className="-mt-3"
          dangerouslySetInnerHTML={{
            __html: marked(`
  ${"```shell"}
  curl ${data.serverUrl}/api/${data.entity.slug}/:id \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -G
  ${"```"}`),
          }}
        />
      </div>
    </div>
  );
}

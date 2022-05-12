import { marked } from "marked";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData } from "remix";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities.db.server";

type LoaderData = {
  entity: EntityWithDetails;
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const data: LoaderData = {
    entity,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  return badRequest(t("shared.invalidForm"));
};

export default function EditEntityIndexRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  return (
    <div className="space-y-2">
      <div className="font-bold">API Docs: IN CONSTRUCTION</div>
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
  curl http://localhost:3000/api/${data.entity.slug} \\
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
  curl http://localhost:3000/api/${data.entity.slug}/:id \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -G
  ${"```"}`),
          }}
        />
      </div>
    </div>
  );
}

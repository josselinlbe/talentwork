import { ActionFunction, json, LoaderFunction, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";

type LoaderData = {};
export let loader: LoaderFunction = async ({ params }) => {
  const data: LoaderData = {};
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
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <div className="font-bold">Webhooks: IN CONSTRUCTION</div>
    </div>
  );
}

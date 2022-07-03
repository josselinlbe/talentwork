import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { actionRowShare } from "~/modules/rows/actions/row-share";
import { loaderRowShare } from "~/modules/rows/loaders/row-share";
import RowShareRoute from "~/modules/rows/routes/RowShareRoute";

export let loader: LoaderFunction = async ({ request, params }) => {
  return json(await loaderRowShare(request, params, null, "contacts", "/admin/crm/contacts"));
};

export const action: ActionFunction = async ({ request, params }) => {
  return await actionRowShare(request, params, null, "contacts", "/admin/crm/contacts");
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default RowShareRoute;

import { ActionFunction, json, LoaderFunction, MetaFunction } from "remix";
import { actionRowEdit } from "~/modules/rows/actions/row-edit";
import { loaderRowEdit } from "~/modules/rows/loaders/row-edit";
import RowEditRoute from "~/modules/rows/routes/RowEditRoute";

export let loader: LoaderFunction = async ({ request, params }) => {
  return json(await loaderRowEdit(request, params, null, "contacts", "/admin/crm/contacts"));
};

export const action: ActionFunction = async ({ request, params }) => {
  return await actionRowEdit(request, params, null, "contacts", "/admin/crm/contacts");
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default RowEditRoute;

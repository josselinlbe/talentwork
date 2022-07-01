import { LoaderFunction, ActionFunction, MetaFunction, json } from "remix";
import { actionRowShare } from "~/modules/rows/actions/row-share";
import { loaderRowShare } from "~/modules/rows/loaders/row-share";
import RowShareRoute from "~/modules/rows/routes/RowShareRoute";

export let loader: LoaderFunction = async ({ request, params }) => {
  return json(await loaderRowShare(request, params, null, "deals", "/admin/crm/deals"));
};

export const action: ActionFunction = async ({ request, params }) => {
  return await actionRowShare(request, params, null, "deals", "/admin/crm/deals");
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default RowShareRoute;

import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { actionRowsView } from "~/modules/rows/actions/rows-view";
import { loaderRowsView } from "~/modules/rows/loaders/rows-view";
import RowsViewRoute from "~/modules/rows/routes/RowsViewRoute";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  const data = await loaderRowsView(request, params, params.entity ?? "", tenantUrl.tenantId);
  return json(data);
};

export const action: ActionFunction = async (args) => {
  return await actionRowsView(args);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default RowsViewRoute;

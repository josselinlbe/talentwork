import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { actionRowTags } from "~/modules/rows/actions/row-tags";
import { loaderRowTags } from "~/modules/rows/loaders/row-tags";
import RowTagsRoute from "~/modules/rows/routes/RowTagsRoute";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return json(await loaderRowTags(request, params, tenantUrl.tenantId, params.entity ?? ""));
};

export const action: ActionFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return await actionRowTags(request, params, tenantUrl.tenantId, params.entity ?? "");
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default RowTagsRoute;

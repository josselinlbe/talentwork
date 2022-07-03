import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { actionRowShare } from "~/modules/rows/actions/row-share";
import { loaderRowShare } from "~/modules/rows/loaders/row-share";
import RowShareRoute from "~/modules/rows/routes/RowShareRoute";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return json(await loaderRowShare(request, params, tenantUrl.tenantId, params.entity ?? "", UrlUtils.currentEntityUrl(params)));
};

export const action: ActionFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return await actionRowShare(request, params, tenantUrl.tenantId, params.entity ?? "", UrlUtils.currentEntityUrl(params));
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default RowShareRoute;

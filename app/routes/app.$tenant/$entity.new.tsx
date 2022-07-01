import { ActionFunction, json, LoaderFunction, MetaFunction } from "remix";
import { actionRowNew } from "~/modules/rows/actions/row-new";
import { loaderRowNew } from "~/modules/rows/loaders/row-new";
import RowNewRoute from "~/modules/rows/routes/RowNewRoute";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return json(await loaderRowNew(request, params, tenantUrl.tenantId, params.entity ?? "", UrlUtils.currentEntityUrl(params)));
};

export const action: ActionFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return await actionRowNew(request, params, tenantUrl.tenantId, params.entity ?? "", UrlUtils.currentEntityUrl(params));
};

export const meta: MetaFunction = ({ data }) => ({ title: data?.title });

export default RowNewRoute;

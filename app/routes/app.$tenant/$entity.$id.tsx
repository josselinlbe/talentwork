import { ActionFunction, json, LoaderFunction, MetaFunction } from "remix";
import { actionRowEdit } from "~/modules/rows/actions/row-edit";
import { loaderRowEdit } from "~/modules/rows/loaders/row-edit";
import RowEditRoute from "~/modules/rows/routes/RowEditRoute";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return json(await loaderRowEdit(request, params, tenantUrl.tenantId, params.entity ?? "", UrlUtils.currentEntityUrl(params)));
};

export const action: ActionFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return await actionRowEdit(request, params, tenantUrl.tenantId, params.entity ?? "", UrlUtils.currentEntityUrl(params));
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default RowEditRoute;

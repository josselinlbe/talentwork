import { json, LoaderFunction } from "@remix-run/node";
import { loaderEmailEdit } from "~/modules/emails/loaders/inbound-email-edit";
import InboundEmailRoute from "~/modules/emails/routes/InboundEmailEditRoute";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return json(await loaderEmailEdit(request, params, tenantUrl, UrlUtils.currentTenantUrl(params, "emails")));
};

export default InboundEmailRoute;

import { json, LoaderFunction } from "@remix-run/node";
import { loaderEmailEdit } from "~/modules/emails/loaders/inbound-email-edit";
import InboundEmailRoute from "~/modules/emails/routes/InboundEmailEditRoute";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return json(await loaderEmailEdit(request, params, tenantUrl));
};

export default InboundEmailRoute;

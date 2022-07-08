import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { loaderEmails } from "~/modules/emails/loaders/inbound-emails";
import InboundEmailsRoute from "~/modules/emails/routes/InboundEmailsRoute";
import { actionInboundEmails } from "~/modules/emails/actions/inbound-emails";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return json(await loaderEmails(request, params, tenantUrl));
};

export const action: ActionFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  return await actionInboundEmails(request, params, tenantUrl);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default InboundEmailsRoute;

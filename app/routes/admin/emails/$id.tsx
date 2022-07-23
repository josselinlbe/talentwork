import { json, LoaderFunction } from "@remix-run/node";
import { loaderEmailEdit } from "~/modules/emails/loaders/inbound-email-edit";
import InboundEmailRoute from "~/modules/emails/routes/InboundEmailEditRoute";

export let loader: LoaderFunction = async ({ request, params }) => {
  return json(await loaderEmailEdit(request, params, null, "/admin/emails"));
};

export default InboundEmailRoute;

import { Params } from "react-router";
import { i18nHelper } from "~/locale/i18n.utils";
import { EmailWithSimpleDetails, getAllEmails } from "~/utils/db/email/emails.db.server";
import { getPostmarkServer } from "~/utils/email.server";
import { getTenantDefaultInboundAddress } from "~/utils/services/emailService";
import { TenantUrl } from "~/utils/services/urlService";

export type LoaderDataEmails = {
  title: string;
  items: EmailWithSimpleDetails[];
  inboundEmailAddress?: any;
  error?: string;
};
export let loaderEmails = async (request: Request, params: Params, tenantUrl: TenantUrl | null) => {
  let { t } = await i18nHelper(request);

  let error = "";
  let inboundEmailAddress = "";
  const server = await getPostmarkServer();
  if (server?.InboundAddress) {
    if (!server.InboundDomain) {
      if (tenantUrl !== null) {
        error = `Invalid inbound domain`;
      } else {
        inboundEmailAddress = `${server.InboundAddress}`;
      }
    } else {
      if (tenantUrl === null) {
        inboundEmailAddress = `support@${server.InboundDomain}`;
      } else {
        const address = await getTenantDefaultInboundAddress(tenantUrl.tenantId);
        if (address) {
          inboundEmailAddress = `${address}@${server.InboundDomain}`;
        } else {
          error = `Invalid account address`;
        }
      }
    }
  }
  const items = await getAllEmails("inbound", tenantUrl?.tenantId ?? null);

  const data: LoaderDataEmails = {
    title: `${t("models.email.plural")} | ${process.env.APP_NAME}`,
    items,
    inboundEmailAddress,
    error,
  };
  return data;
};

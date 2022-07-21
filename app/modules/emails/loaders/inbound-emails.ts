import { Params } from "react-router";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { i18nHelper } from "~/locale/i18n.utils";
import { EmailWithSimpleDetails, getAllEmails } from "~/utils/db/email/emails.db.server";
import { getPostmarkServer } from "~/utils/email.server";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getTenantDefaultInboundAddress } from "~/utils/services/emailService";
import { TenantUrl } from "~/utils/services/urlService";

export type LoaderDataEmails = {
  title: string;
  items: EmailWithSimpleDetails[];
  inboundEmailAddress?: any;
  error?: string;
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
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

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "fromName",
      title: "models.email.fromName",
    },
    {
      name: "fromEmail",
      title: "models.email.fromEmail",
    },
    {
      name: "toName",
      title: "models.email.toName",
    },
    {
      name: "toEmail",
      title: "models.email.toEmail",
    },
    {
      name: "subject",
      title: "models.email.subject",
    },
    {
      name: "textBody",
      title: "models.email.textBody",
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const currentPagination = getPaginationFromCurrentUrl(request);

  const { items, pagination } = await getAllEmails("inbound", currentPagination, filters, tenantUrl?.tenantId ?? null);

  const data: LoaderDataEmails = {
    title: `${t("models.email.plural")} | ${process.env.APP_NAME}`,
    items,
    inboundEmailAddress,
    error,
    pagination,
    filterableProperties,
  };
  return data;
};

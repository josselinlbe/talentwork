import { json } from "@remix-run/node";
import { createEmail, EmailWithSimpleDetails, getAllEmails, getEmailByMessageId } from "~/utils/db/email/emails.db.server";
import { Params } from "react-router";
import { i18nHelper } from "~/locale/i18n.utils";
import { getPostmarkInboundMessages, getPostmarkInboundMessage } from "~/utils/email.server";
import { TenantUrl } from "~/utils/services/urlService";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

export type ActionDataEmails = {
  error?: string;
  items?: EmailWithSimpleDetails[];
};
const badRequest = (data: ActionDataEmails) => json(data, { status: 400 });
export const actionInboundEmails = async (request: Request, params: Params, tenantUrl: TenantUrl | null) => {
  const { t } = await i18nHelper(request);
  const form = await request.formData();

  const action = form.get("action");
  if (action === "sync") {
    const allEmails = await getPostmarkInboundMessages();
    await Promise.all(
      allEmails.map(async (newEmail) => {
        const messageId = newEmail.MessageID.toString();
        const existing = await getEmailByMessageId(messageId);
        if (existing) {
          return;
        }
        const email = await getPostmarkInboundMessage(messageId);
        if (!email) {
          return;
        }

        // const tenantInboundAddress = await getTenantDefaultInboundAddress(tenantUrl?.tenantId ?? "")
        await createEmail({
          tenantInboundAddressId: null,
          messageId: email.MessageID,
          type: "inbound",
          date: new Date(email.Date),
          subject: email.Subject,
          fromEmail: email.From,
          fromName: email.FromName,
          toEmail: email.ToFull[0].Email,
          toName: email.ToFull[0].Name,
          textBody: email.TextBody,
          htmlBody: email.HtmlBody,
          cc: { create: email.CcFull.map((cc: any) => ({ toEmail: cc.Email, toName: cc.Name })) },
          // attachments:
          //   attachmentsWithContent.length > 0
          //     ? {
          //         create: attachmentsWithContent.map((attachment: any) => ({
          //           name: attachment.Name,
          //           content: attachment.Content,
          //           type: attachment.ContentType,
          //           length: attachment.ContentLength,
          //         })),
          //       }
          //     : undefined,
        });
      })
    );

    const currentPagination = getPaginationFromCurrentUrl(request);
    const items = await getAllEmails("inbound", currentPagination, undefined, tenantUrl?.tenantId ?? null);
    return json({
      items,
    });
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

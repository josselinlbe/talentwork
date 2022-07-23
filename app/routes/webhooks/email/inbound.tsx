import { ActionFunction, json } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { updateEmailAttachmentFileProvider } from "~/utils/db/email/emailAttachments.db.server";
import { createEmail, getEmail } from "~/utils/db/email/emails.db.server";
import { getTenantInboundAddress } from "~/utils/db/email/tenantInboundAddresses.db.server";
import { createSupabaseFile, getSupabaseAttachmentBucket, getSupabaseAttachmentPath } from "~/utils/integrations/supabaseService";

export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method === "POST") {
      const email = await request.json();
      const messageId = email.MessageID.toString();
      const existingMessage = await db.email.findUnique({
        where: { messageId },
      });
      if (existingMessage) {
        return json({ error: "Message already exists" }, { status: 400 });
      }

      const fromInboundAddress = email.ToFull[0].Email.split("@")[0];
      const tenantWithInboundAddress = await getTenantInboundAddress(fromInboundAddress);
      const createdEmail = await createEmail({
        tenantInboundAddressId: tenantWithInboundAddress?.id ?? null,
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
        attachments: {
          create: email.Attachments.map((attachment: any) => ({
            name: attachment.Name,
            content: `data:${attachment.ContentType};base64,${attachment.Content}`,
            type: attachment.ContentType,
            length: attachment.ContentLength,
          })),
        },
      });
      const emailWithAttachments = await getEmail(createdEmail.id, tenantWithInboundAddress?.tenantId ?? null);
      if (emailWithAttachments && emailWithAttachments.attachments.length > 0) {
        if (process.env.SUPABASE_API_URL && process.env.SUPABASE_KEY) {
          await Promise.all(
            emailWithAttachments?.attachments.map(async (attachment) => {
              const blob = await (await fetch(attachment.content)).blob();
              const file = new File([blob], attachment.name);

              try {
                const storageBucket = getSupabaseAttachmentBucket();
                const createdFile = await createSupabaseFile(storageBucket, getSupabaseAttachmentPath(attachment), file);
                if (createdFile.publicUrl) {
                  return await updateEmailAttachmentFileProvider(attachment.id, {
                    content: "",
                    publicUrl: createdFile.publicUrl,
                    storageBucket,
                    storageProvider: "supabase",
                  });
                }
              } catch (e) {
                // eslint-disable-next-line no-console
                console.log("Could not create file: " + e);
              }
            })
          );
        }
      }

      return json({}, { status: 201 });
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};

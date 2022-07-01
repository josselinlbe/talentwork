import { ActionFunction, json } from "remix";
import { db } from "~/utils/db.server";
import { createEmail } from "~/utils/db/email/emails.db.server";

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

      await createEmail({
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
            content: attachment.Content,
            type: attachment.ContentType,
            length: attachment.ContentLength,
          })),
        },
      });
      return json({}, { status: 201 });
    }
  } catch (e: any) {
    return json({ error: JSON.stringify(e) }, { status: 400 });
  }
};

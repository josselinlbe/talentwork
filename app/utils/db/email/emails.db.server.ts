import { Email, EmailAttachment, EmailCc } from "@prisma/client";
import { db } from "~/utils/db.server";

export type EmailWithSimpleDetails = Email & {
  cc: EmailCc[];
  _count: { attachments: number };
};

export type EmailWithDetails = Email & {
  cc: EmailCc[];
  attachments: EmailAttachment[];
};

export function getAllEmails(type: string): Promise<EmailWithSimpleDetails[]> {
  return db.email.findMany({
    where: {
      type,
    },
    include: {
      cc: true,
      _count: {
        select: {
          attachments: true,
        },
      },
    },
  });
}

export function getEmail(id: string): Promise<EmailWithDetails | null> {
  return db.email.findFirst({
    where: {
      id,
    },
    include: {
      cc: true,
      attachments: true,
    },
  });
}

export function getEmailByMessageId(messageId: string): Promise<EmailWithDetails | null> {
  return db.email.findFirst({
    where: {
      messageId,
    },
    include: {
      cc: true,
      attachments: true,
    },
  });
}

export function createEmail(data: {
  messageId: any;
  type: string;
  date: Date;
  subject: any;
  fromEmail: any;
  fromName: any;
  toEmail: any;
  toName: any;
  textBody: any;
  htmlBody: any;
  cc: {
    create: any;
  };
  attachments:
    | {
        create?: any;
      }
    | undefined;
}) {
  return db.email.create({
    data,
  });
}

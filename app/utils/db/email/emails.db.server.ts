import { Email, EmailAttachment, EmailCc, EmailRead, TenantInboundAddress } from "@prisma/client";
import { db } from "~/utils/db.server";

export type EmailWithSimpleDetails = Email & {
  tenantInboundAddress?: TenantInboundAddress | null;
  cc: EmailCc[];
  _count: { attachments: number; reads: number };
};

export type EmailWithDetails = Email & {
  tenantInboundAddress?: TenantInboundAddress | null;
  cc: EmailCc[];
  reads: EmailRead[];
  attachments: EmailAttachment[];
};

export async function getAllEmails(type: string, tenantId?: string | null): Promise<EmailWithSimpleDetails[]> {
  return await db.email.findMany({
    where: {
      type,
      ...whereInboundAddress(tenantId),
    },
    include: {
      tenantInboundAddress: true,
      cc: true,
      _count: {
        select: {
          attachments: true,
          reads: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}

export function getEmail(id: string, tenantId?: string | null): Promise<EmailWithDetails | null> {
  return db.email.findFirst({
    where: {
      id,
      ...whereInboundAddress(tenantId),
    },
    include: {
      tenantInboundAddress: true,
      cc: true,
      attachments: true,
      reads: true,
    },
  });
}

export function getEmailByMessageId(messageId: string): Promise<EmailWithDetails | null> {
  return db.email.findFirst({
    where: {
      messageId,
    },
    include: {
      tenantInboundAddress: true,
      cc: true,
      attachments: true,
      reads: true,
    },
  });
}

export function createEmail(data: {
  tenantInboundAddressId: string | null;
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
  attachments?:
    | {
        create?: any;
      }
    | undefined;
}) {
  return db.email.create({
    data,
  });
}

export function getEmailReads(id: string, readByUserId: string): Promise<EmailRead[]> {
  return db.emailRead.findMany({
    where: {
      emailId: id,
      userId: readByUserId,
    },
  });
}

export function createEmailRead(emailId: string, userId: string): Promise<EmailRead> {
  return db.emailRead.create({
    data: {
      emailId,
      userId,
    },
  });
}

function whereInboundAddress(tenantId?: string | null) {
  if (!tenantId) {
    return {
      tenantInboundAddress: {
        is: null,
      },
    };
  } else {
    return {
      tenantInboundAddress: {
        tenantId,
      },
    };
  }
}

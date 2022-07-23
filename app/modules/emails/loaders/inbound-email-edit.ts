import { EmailRead } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { Params } from "@remix-run/react";
import { createEmailRead, EmailWithDetails, getEmail, getEmailReads } from "~/utils/db/email/emails.db.server";
import { TenantUrl } from "~/utils/services/urlService";
import { getUserInfo } from "~/utils/session.server";

export type LoaderDataInboundEmailEdit = {
  item: EmailWithDetails;
  myRead: EmailRead;
  redirectUrl: string;
};
export let loaderEmailEdit = async (request: Request, params: Params, tenantUrl: TenantUrl | null, redirectUrl: string) => {
  const userInfo = await getUserInfo(request);
  const item = await getEmail(params.id ?? "", tenantUrl?.tenantId ?? null);
  if (!item) {
    throw redirect("/admin/emails");
  }
  const myReads = await getEmailReads(params.id ?? "", userInfo.userId);
  let myRead: EmailRead | null = null;
  if (myReads.length === 0) {
    myRead = await createEmailRead(item.id, userInfo.userId);
  } else {
    myRead = myReads[0];
  }
  const data: LoaderDataInboundEmailEdit = {
    item,
    myRead,
    redirectUrl,
  };
  return data;
};

import { redirect } from "@remix-run/node";
import { db } from "../db.server";
import { Params } from "react-router";

export type TenantUrl = {
  tenantId: string;
};

export async function getTenantUrl(params: Params, withRedirect: boolean = true) {
  const { tenant } = params;
  if (withRedirect && !tenant) {
    if (tenant) {
      throw redirect("/app/" + tenant);
    }
    throw redirect("/app");
  }

  const current: TenantUrl = {
    tenantId: "",
  };

  // if :tenant param is shorter than 25, it's an id
  current.tenantId = await getTenantFromParams(tenant);

  return current;
}

export async function getTenantFromParams(tenant: string | undefined) {
  if ((tenant ?? "").length >= 25) {
    return tenant ?? "";
  } else {
    // get tenant.id from slug
    return (
      (
        await db.tenant.findFirst({
          where: {
            OR: [
              {
                slug: tenant,
              },
              {
                id: tenant,
              },
            ],
          },
          select: {
            id: true,
          },
        })
      )?.id ?? ""
    );
  }
}

import { redirect } from "remix";
import { db } from "../db.server";
import { Params } from "react-router";

export type TenantUrl = {
  tenantId: string;
  workspaceId: string;
};

export async function getTenantUrl(params: Params, withRedirect: boolean = true) {
  const { tenant, workspace } = params;
  if (withRedirect && (!tenant || !workspace)) {
    if (tenant) {
      throw redirect("/app/" + tenant);
    }
    throw redirect("/app");
  }

  const current: TenantUrl = {
    tenantId: "",
    workspaceId: workspace ?? "",
  };

  // if :tenant param is shorter than 25, it's an id
  if ((tenant ?? "").length >= 25) {
    current.tenantId = tenant ?? "";
  } else {
    // get tenant.id from slug
    current.tenantId =
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
      )?.id ?? "";
  }

  return current;
}

import { json, useMatches } from "remix";
import { i18n } from "~/locale/i18n.server";
import { Tenant, TenantUser, Workspace } from "@prisma/client";
import { getTenantWithUsersAndWorkspaces } from "../db/tenants.db.server";

export type AdminTenantLoaderData = {
  title: string;
  tenant:
    | (Tenant & {
        workspaces: Workspace[];
        users: TenantUser[];
      })
    | null;
};

export function useAdminTenantData(id?: string): AdminTenantLoaderData {
  return (useMatches().find((f) => f.pathname === "/admin/tenant/" + id)?.data ?? {}) as AdminTenantLoaderData;
}

export async function loadAdminTenantData(request: Request, id?: string) {
  let t = await i18n.getFixedT(request, "translations");
  const tenant = await getTenantWithUsersAndWorkspaces(id);
  const data: AdminTenantLoaderData = {
    title: `${t("models.tenant.object")} | ${process.env.APP_NAME}`,
    tenant,
  };
  return json(data);
}

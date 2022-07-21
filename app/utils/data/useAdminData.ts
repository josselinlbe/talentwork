import { redirect } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import { getUserInfo } from "../session.server";
import { getUser } from "../db/users.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "../app/UrlUtils";
import { getAllEntities } from "../db/entities/entities.db.server";
import { getMyTenants } from "../db/tenants.db.server";
import { getUserRoles } from "../db/permissions/userRoles.db.server";
import { AppOrAdminData } from "./useAppOrAdminData";
import { getAllRoles } from "../db/permissions/roles.db.server";
import { DefaultAdminRoles } from "~/application/dtos/shared/DefaultAdminRoles";
import { getMyGroups } from "../db/permissions/groups.db.server";

export type AdminLoaderData = AppOrAdminData;

export function useAdminData(): AdminLoaderData {
  const paths: string[] = ["routes/admin"];
  return (useMatches().find((f) => paths.includes(f.id.toLowerCase()))?.data ?? {}) as AdminLoaderData;
}

export async function loadAdminData(request: Request) {
  const { translations } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === `/admin`) {
    throw redirect(`/admin/dashboard`);
  }
  const user = await getUser(userInfo?.userId);
  const redirectTo = new URL(request.url).pathname;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  if (!user.admin) {
    throw redirect("/401");
  }

  const myTenants = await getMyTenants(user.id);

  const roles = await getUserRoles(userInfo.userId ?? undefined);
  const permissions: string[] = [];
  roles.forEach((role) => {
    role.role.permissions.forEach((permission) => {
      if (!permissions.includes(permission.permission.name)) {
        permissions.push(permission.permission.name);
      }
    });
  });
  const data: AdminLoaderData = {
    i18n: translations,
    user,
    myTenants,
    entities: await getAllEntities(),
    roles,
    allRoles: await getAllRoles("admin"),
    permissions,
    isSuperUser: roles.find((f) => f.role.name === DefaultAdminRoles.SuperAdmin) !== undefined,
    isSuperAdmin: roles.find((f) => f.role.name === DefaultAdminRoles.SuperAdmin) !== undefined,
    myGroups: await getMyGroups(user.id, null),
  };
  return data;
}

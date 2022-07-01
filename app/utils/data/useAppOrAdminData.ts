import { useMatches } from "remix";
import { MyTenant } from "../db/tenants.db.server";
import { UserWithoutPassword } from "../db/users.db.server";
import { Role } from "@prisma/client";
import { UserRoleWithPermission } from "../db/permissions/userRoles.db.server";
import { AppLoaderData } from "./useAppData";
import { AdminLoaderData } from "./useAdminData";
import { Language } from "remix-i18next";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { GroupWithDetails } from "../db/permissions/groups.db.server";

export type AppOrAdminData = {
  i18n: Record<string, Language>;
  user: UserWithoutPassword;
  myTenants: MyTenant[];
  allRoles: Role[];
  roles: UserRoleWithPermission[];
  permissions: string[];
  entities: EntityWithDetails[];
  isSuperUser: boolean;
  myGroups: GroupWithDetails[];
};

export function useAppOrAdminData(): AppOrAdminData {
  const appPaths: string[] = ["routes/app.$tenant", "routes/app"];
  const appData = (useMatches().find((f) => appPaths.includes(f.id.toLowerCase()))?.data ?? {}) as AppLoaderData;

  const adminPaths: string[] = ["routes/admin"];
  const adminData = (useMatches().find((f) => adminPaths.includes(f.id.toLowerCase()))?.data ?? {}) as AdminLoaderData;
  const appOrAdminData = appData.user ? appData : adminData;
  return appOrAdminData;
}

import { Params } from "react-router";
import { redirect } from "remix";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { getTenantMember } from "./db/tenants.db.server";
import { getUser } from "./db/users.db.server";
import { getTenantUrl } from "./services/urlService";
import { getUserInfo } from "./session.server";

export async function requireAdminUser(request: Request) {
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user?.admin) {
    throw redirect("/401");
  }
}

export async function requireOwnerOrAdminRole(request: Request, params: Params) {
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user?.admin) {
    const tenantMember = await getTenantMember(userInfo.userId, tenantUrl.tenantId);
    if (!tenantMember || (tenantMember.role !== TenantUserRole.OWNER && tenantMember.role !== TenantUserRole.ADMIN)) {
      throw redirect("/401");
    }
  }
}

export async function requireAuthorization(currentPath: string, currentRole: TenantUserRole, params: Params) {
  let foundItem: SideBarItem | undefined;
  AppSidebar(params).forEach((f) => {
    f.items?.forEach((item) => {
      if (currentPath.includes(item.path)) {
        foundItem = item;
      }
    });
  });
  if (foundItem && foundItem.userRoles && !foundItem.userRoles.includes(currentRole)) {
    throw redirect("/401");
  }
}

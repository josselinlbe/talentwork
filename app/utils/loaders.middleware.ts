import { redirect } from "remix";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { getTenantMember } from "./db/tenants.db.server";
import { getUser } from "./db/users.db.server";
import { getTenantUrl } from "./services/urlService";
import { getUserInfo } from "./session.server";
import { Params } from "react-router";
import { EntityWithDetails } from "./db/entities/entities.db.server";

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
    if (!tenantMember || (tenantMember.type !== TenantUserType.OWNER && tenantMember.type !== TenantUserType.ADMIN)) {
      throw redirect("/401");
    }
  }
}

export async function requireAuthorization(currentPath: string, currentRole: TenantUserType, params: Params, entities: EntityWithDetails[]) {
  let foundItem: SideBarItem | undefined;
  AppSidebar(params, entities).forEach((f) => {
    f.items?.forEach((item) => {
      if (currentPath.includes(item.path)) {
        foundItem = item;
      }
    });
  });
  if (foundItem && foundItem.tenantUserTypes && !foundItem.tenantUserTypes.includes(currentRole)) {
    throw redirect("/401");
  }
}

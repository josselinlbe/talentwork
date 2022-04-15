import { SideBarItem } from "./SidebarItem";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { SvgIcon } from "../enums/shared/SvgIcon";
import UrlUtils from "~/utils/app/UrlUtils";
import { Params } from "react-router";

export const AppSidebar = (params: Params): SideBarItem[] => {
  const currentTenantUrl = UrlUtils.stripTrailingSlash(UrlUtils.currentTenantUrl(params));
  return [
    {
      title: "",
      path: "",
      items: [
        {
          title: "app.sidebar.dashboard",
          path: `${currentTenantUrl}/dashboard`,
          icon: SvgIcon.DASHBOARD,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
        },
        {
          title: "models.contract.plural",
          icon: SvgIcon.CONTRACTS,
          path: `${currentTenantUrl}/contracts`,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
          isDemo: true,
        },
        {
          title: "models.employee.plural",
          icon: SvgIcon.EMPLOYEES,
          path: `${currentTenantUrl}/employees`,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
          isDemo: true,
        },
      ],
    },
    {
      title: "",
      path: "",
      items: [
        {
          title: "app.sidebar.settings",
          icon: SvgIcon.SETTINGS,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
          path: `${currentTenantUrl}/settings`,
        },
        {
          title: "app.sidebar.events",
          icon: SvgIcon.EVENTS,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
          path: `${currentTenantUrl}/events`,
        },
        {
          title: "admin.switchToAdmin",
          path: "/admin/dashboard",
          icon: SvgIcon.ADMIN,
          adminOnly: true,
        },
      ],
    },
  ];
};

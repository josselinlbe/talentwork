import { SideBarItem } from "./SidebarItem";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { SvgIcon } from "../enums/shared/SvgIcon";
import UrlUtils from "~/utils/app/UrlUtils";
import { Params } from "react-router";
import { Entity } from "@prisma/client";

export const AppSidebar = (params: Params, entities: Entity[]): SideBarItem[] => {
  const currentTenantUrl = UrlUtils.stripTrailingSlash(UrlUtils.currentTenantUrl(params));

  const entitiesItems: SideBarItem[] = [];
  entities
    .filter((f) => f.isAutogenerated)
    .forEach((entity) => {
      entitiesItems.push({
        title: entity.titlePlural,
        entityIcon: entity.icon,
        // userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
        path: `${currentTenantUrl}/` + entity.slug,
      });
    });
  const appItem: SideBarItem = {
    title: "",
    path: "",
    items: [
      {
        title: "app.sidebar.dashboard",
        path: `${currentTenantUrl}/dashboard`,
        icon: SvgIcon.DASHBOARD,
        userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
      },
      // {
      //   title: "models.contract.plural",
      //   icon: SvgIcon.CONTRACTS,
      //   path: `${currentTenantUrl}/contracts`,
      //   userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
      //   isDemo: true,
      // },
      // {
      //   title: "models.employee.plural",
      //   icon: SvgIcon.EMPLOYEES,
      //   path: `${currentTenantUrl}/employees`,
      //   userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
      //   isDemo: true,
      // },
      ...entitiesItems,
    ],
  };
  return [
    appItem,
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
        // {
        //   title: "app.sidebar.logs",
        //   icon: SvgIcon.LOGS,
        //   userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
        //   path: `${currentTenantUrl}/logs`,
        // },
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

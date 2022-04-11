import { SideBarItem } from "./SidebarItem";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { UserType } from "~/application/enums/users/UserType";
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
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
        },
        // {
        //   title: "models.joke.plural",
        //   path: `${currentTenantUrl}/jokes`,
        //   icon: SvgIcon.JOKES,
        //   userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
        // },
        {
          title: "models.contract.plural",
          path: `${currentTenantUrl}/contracts`,
          icon: SvgIcon.CONTRACTS,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
          isDemo: true,
          items: [
            {
              title: "models.link.plural",
              path: `${currentTenantUrl}/links`,
              // icon: SvgIcon.LINKS,
              userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
              isDemo: true,
            },
            {
              title: "models.contract.plural",
              path: `${currentTenantUrl}/contracts`,
              // icon: SvgIcon.CONTRACTS,
              userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
              isDemo: true,
            },
            {
              title: "models.employee.plural",
              path: `${currentTenantUrl}/employees`,
              // icon: SvgIcon.EMPLOYEES,
              userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
              isDemo: true,
            },
          ],
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
          // items: [
          //   {
          //     title: "app.navbar.profile",
          //     path: `${currentTenantUrl}/settings/profile`,
          //   },
          //   {
          //     title: "models.workspace.plural",
          //     path: `${currentTenantUrl}/settings/workspaces`,
          //     userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
          //   },
          //   {
          //     title: "settings.members.title",
          //     path: `${currentTenantUrl}/settings/members`,
          //     userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
          //   },
          //   {
          //     title: "settings.subscription.title",
          //     path: `${currentTenantUrl}/settings/subscription`,
          //     userRoles: [TenantUserRole.OWNER],
          //   },
          //   {
          //     title: "app.navbar.tenant",
          //     path: `${currentTenantUrl}/settings/tenant`,
          //     userRoles: [TenantUserRole.OWNER],
          //   },
          // ],
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
          userTypes: [UserType.Admin],
        },
      ],
    },
  ];
};

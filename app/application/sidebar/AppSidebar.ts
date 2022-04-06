import { SideBarItem } from "./SidebarItem";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { UserType } from "~/application/enums/users/UserType";
import { SvgIcon } from "../enums/shared/SvgIcon";

export const AppSidebar = (tenant: string, workspace: string): SideBarItem[] => {
  const sessionUrl = `/app/${tenant}/${workspace}`;
  return [
    {
      title: "app.sidebar.app",
      path: "",
      items: [
        {
          title: "app.sidebar.dashboard",
          path: `${sessionUrl}/dashboard`,
          icon: SvgIcon.DASHBOARD,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
        },
        // {
        //   title: "models.joke.plural",
        //   path: `${sessionUrl}/jokes`,
        //   icon: SvgIcon.JOKES,
        //   userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
        // },
        {
          title: "models.link.plural",
          path: `${sessionUrl}/links`,
          icon: SvgIcon.LINKS,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
        },
        {
          title: "models.contract.plural",
          path: `${sessionUrl}/contracts`,
          icon: SvgIcon.CONTRACTS,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
        },
        {
          title: "models.employee.plural",
          path: `${sessionUrl}/employees`,
          icon: SvgIcon.EMPLOYEES,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
        },
        {
          title: "app.navbar.settings",
          icon: SvgIcon.SETTINGS,
          userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
          path: `${sessionUrl}/settings`,
          items: [
            {
              title: "app.navbar.profile",
              path: `${sessionUrl}/settings/profile`,
            },
            {
              title: "models.workspace.plural",
              path: `${sessionUrl}/settings/workspaces`,
              userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
            },
            {
              title: "settings.members.title",
              path: `${sessionUrl}/settings/members`,
              userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
            },
            {
              title: "settings.subscription.title",
              path: `${sessionUrl}/settings/subscription`,
              userRoles: [TenantUserRole.OWNER],
            },
            {
              title: "app.navbar.tenant",
              path: `${sessionUrl}/settings/tenant`,
              userRoles: [TenantUserRole.OWNER],
            },
          ],
        },
      ],
    },
    {
      title: "admin.title",
      path: "",
      items: [
        {
          title: "admin.switchToAdmin",
          path: "/admin/tenants",
          icon: SvgIcon.ADMIN,
          userTypes: [UserType.Admin],
        },
      ],
    },
  ];
};

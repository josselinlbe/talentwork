import { SideBarItem } from "./SidebarItem";
import { SvgIcon } from "../enums/shared/SvgIcon";

export const AdminSidebar: SideBarItem[] = [
  {
    title: "app.sidebar.admin",
    path: "",
    items: [
      {
        title: "app.sidebar.dashboard",
        path: "/admin/dashboard",
        icon: SvgIcon.DASHBOARD,
      },
      {
        title: "admin.tenants.title",
        path: "/admin/accounts",
        icon: SvgIcon.TENANTS,
        items: [],
        permission: "admin.accounts.view",
      },
      {
        title: "models.user.plural",
        path: "/admin/users",
        icon: SvgIcon.USERS,
        items: [],
        permission: "admin.users.view",
      },
      {
        title: "app.sidebar.rolesAndPermissions",
        path: "/admin/roles-and-permissions",
        icon: SvgIcon.ROLES,
        items: [],
        permission: "admin.roles.view",
      },
      {
        title: "blog.title",
        path: "/admin/blog",
        icon: SvgIcon.BLOG,
        permission: "admin.blog.view",
      },
      {
        title: "models.entity.plural",
        path: "/admin/entities",
        icon: SvgIcon.ENTITIES,
        permission: "admin.entities.view",
      },
      {
        title: "API",
        path: "/admin/api",
        icon: SvgIcon.KEYS,
        permission: "admin.apiKeys.view",
      },
      {
        title: "models.log.plural",
        path: "/admin/audit-trails",
        icon: SvgIcon.LOGS,
        permission: "admin.auditTrails.view",
      },
      {
        title: "CRM",
        path: "/admin/crm",
        icon: SvgIcon.CLIENTS,
      },
      {
        title: "models.email.plural",
        path: "/admin/emails",
        icon: SvgIcon.EMAILS,
      },
      {
        title: "Docs",
        path: "/docs",
        icon: SvgIcon.DOCS,
      },
      {
        title: "app.sidebar.setup",
        path: "/admin/setup",
        icon: SvgIcon.SETUP,
        items: [
          {
            title: "admin.pricing.title",
            path: "/admin/setup/pricing",
            items: [],
          },
          {
            title: "admin.emails.title",
            path: "/admin/setup/emails",
            items: [],
          },
        ],
      },
      // {
      //   title: "admin.navigation.title",
      //   path: "/admin/navigation",
      //   icon: SvgIcon.NAVIGATION,
      //   items: [],
      // },
      // {
      //   title: "admin.components.title",
      //   path: "/admin/components",
      //   icon: SvgIcon.COMPONENTS,
      //   items: [],
      // },
      // {
      //   title: "app.navbar.profile",
      //   path: "/admin/profile",
      //   icon: SvgIcon.PROFILE,
      // },
      // {
      //   title: "app.sidebar.setup",
      //   path: "/admin/setup",
      //   icon: SvgIcon.SETTINGS,
      //   // items: [
      //   // ],
      // },
      // {
      //   title: "settings.members.title",
      //   path: "/admin/members",
      //   icon: SvgIcon.MEMBERS,
      //   tenantUserTypes: [TenantUserType.OWNER, TenantUserType.ADMIN],
      // },
    ],
  },
  {
    title: "App",
    path: "",
    items: [
      {
        title: "admin.switchToApp",
        path: "/app",
        icon: SvgIcon.APP,
        items: [],
        exact: true,
      },
    ],
  },
];

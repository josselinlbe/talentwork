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
        path: "/admin/tenants",
        icon: SvgIcon.TENANTS,
        items: [],
      },
      {
        title: "models.user.plural",
        path: "/admin/users",
        icon: SvgIcon.USERS,
        items: [],
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
      {
        title: "app.sidebar.setup",
        path: "/admin/setup",
        icon: SvgIcon.SETTINGS,
        // items: [
        //   {
        //     title: "admin.pricing.title",
        //     path: "/admin/setup/pricing",
        //     items: [],
        //     // icon: SvgIcon.PRICING,
        //   },
        //   {
        //     title: "admin.emails.title",
        //     path: "/admin/emails",
        //     // icon: SvgIcon.EMAILS,
        //     items: [],
        //   },
        // ],
      },
      // {
      //   title: "settings.members.title",
      //   path: "/admin/members",
      //   icon: SvgIcon.MEMBERS,
      //   userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
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
      },
    ],
  },
];

import { TenantUserRole } from "../enums/tenants/TenantUserRole";
import { SvgIcon } from "../enums/shared/SvgIcon";

export interface SideBarItem {
  title: string;
  path: string;
  icon?: SvgIcon;
  description?: string;
  entityIcon?: string;
  open?: boolean;
  adminOnly?: boolean;
  userRoles?: TenantUserRole[];
  items?: SideBarItem[];
  isDemo?: boolean;
}

import { TenantUserType } from "../enums/tenants/TenantUserType";
import { SvgIcon } from "../enums/shared/SvgIcon";

export interface SideBarItem {
  title: string;
  path: string;
  icon?: SvgIcon;
  description?: string;
  entityIcon?: string;
  open?: boolean;
  adminOnly?: boolean;
  tenantUserTypes?: TenantUserType[];
  items?: SideBarItem[];
  isDemo?: boolean;
  exact?: boolean;
}

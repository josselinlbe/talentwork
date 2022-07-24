import { DefaultAdminRoles } from "~/application/dtos/shared/DefaultAdminRoles";
import { DefaultAppRoles } from "~/application/dtos/shared/DefaultAppRoles";
import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import { createPermissions, getAllPermissions } from "~/utils/db/permissions/permissions.db.server";
import { createRolePermission } from "~/utils/db/permissions/rolePermissions.db.server";
import { createRole, getRoleByName } from "~/utils/db/permissions/roles.db.server";
import { createUserRole } from "~/utils/db/permissions/userRoles.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { adminGetAllUsers } from "~/utils/db/users.db.server";
import { getEntityPermissions } from "~/utils/helpers/PermissionsHelper";

export async function seedRolesAndPermissions() {
  // SuperAdmin has all permissions
  const adminRoles = await seedRoles([
    // /admin
    { name: DefaultAdminRoles.SuperAdmin, description: "Has all admin permissions", type: "admin", assignToNewUsers: false },
    { name: "Product Designer", description: "Manages entities", type: "admin", assignToNewUsers: false },
    { name: "Developer", description: "Manages API Keys", type: "admin", assignToNewUsers: false },
    { name: "Auditor", description: "Views application audit trails", type: "admin", assignToNewUsers: false },
    { name: "Marketing", description: "Manages blog", type: "admin", assignToNewUsers: false },
    { name: "Guest", description: "Views admin pages, but cannot update or delete", type: "admin", assignToNewUsers: true },
  ]);

  const appRoles = await seedRoles([
    // /app
    { name: DefaultAppRoles.SuperUser, description: "Has all app permissions", type: "app", assignToNewUsers: false },
    { name: "Admin", description: "Has all app permissions but account deletion", type: "app", assignToNewUsers: false },
    { name: "Billing Admin", description: "Has subscription permissions", type: "app", assignToNewUsers: false },
    { name: "Manager", description: "Manager for projets & talents pool", type: "app", assignToNewUsers: false},
    { name: "User", description: "Has regular permissions", type: "app", assignToNewUsers: true },
  ]);

  await createPermissions([
    {
      inRoles: [DefaultAdminRoles.SuperAdmin, "Marketing", "Product Designer", "Developer", "Auditor", "Guest"],
      name: "admin.dashboard.view",
      description: "View dashboard page",
      type: "admin",
    },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Guest"], name: "admin.accounts.view", description: "View accounts page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Guest"], name: "admin.account.view", description: "View account page", type: "admin" },
    {
      inRoles: [DefaultAdminRoles.SuperAdmin],
      name: "admin.account.settings.update",
      description: "Update account settings - Name, Slug, and Icon",
      type: "admin",
    },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.account.users", description: "View account users", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.account.subscription", description: "Update account subscription", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.account.delete", description: "Delete account", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Guest"], name: "admin.users.view", description: "View users page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.users.impersonate", description: "Can impersonate users", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.users.changePassword", description: "Can change user passwords", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.users.delete", description: "Delete users", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Guest"], name: "admin.roles.view", description: "View roles & permissions page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.roles.create", description: "Create roles & permissions", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.roles.update", description: "Update role & permission", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.roles.delete", description: "Delete role & permission", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin], name: "admin.roles.set", description: "Set user roles", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Marketing", "Guest"], name: "admin.blog.view", description: "View blog posts page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Marketing"], name: "admin.blog.create", description: "Create blog posts", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Marketing"], name: "admin.blog.update", description: "Update blog post", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Marketing"], name: "admin.blog.delete", description: "Delete blog post", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer", "Guest"], name: "admin.entities.view", description: "View entities page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.entities.create", description: "Create entities", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.entities.update", description: "Update entity", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.entities.delete", description: "Delete entity", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Developer", "Guest"], name: "admin.apiKeys.view", description: "View API Keys page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Developer"], name: "admin.apiKeys.create", description: "Create API Key", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Developer"], name: "admin.apiKeys.update", description: "Update API Key", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Developer"], name: "admin.apiKeys.delete", description: "Delete API Key", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Auditor", "Guest"], name: "admin.auditTrails.view", description: "View Audit Trails page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Auditor", "Developer"], name: "admin.events.view", description: "View Events and Webhooks page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer", "Guest"], name: "admin.pricing.view", description: "View API Keys page", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.pricing.create", description: "Create plan", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.pricing.update", description: "Update plan", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.pricing.delete", description: "Delete plan", type: "admin" },
    {
      inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer", "Guest"],
      name: "admin.emails.view",
      description: "View email templates page",
      type: "admin",
    },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.emails.create", description: "Create email template", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.emails.update", description: "Update email", type: "admin" },
    { inRoles: [DefaultAdminRoles.SuperAdmin, "Product Designer"], name: "admin.emails.delete", description: "Delete delete", type: "admin" },
  ]);

  const appPermissions = [
    { inRoles: [DefaultAppRoles.SuperUser, "Admin", "User"], name: "app.dashboard.view", description: "View dashboard page", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.members.view", description: "View members page", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.members.create", description: "Create member", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.members.update", description: "Update member", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.members.delete", description: "Delete member", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.roles.view", description: "View user roles", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.roles.set", description: "Set user roles", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.groups.full", description: "Manage all user groups", type: "app" },
    {
      inRoles: [DefaultAppRoles.SuperUser, "Admin", "Billing Admin"],
      name: "app.settings.subscription.view",
      description: "View account's subscription page",
      type: "app",
    },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin", "Billing Admin"], name: "app.settings.subscription.update", description: "Subscribe to plan", type: "app" },
    {
      inRoles: [DefaultAppRoles.SuperUser, "Admin", "Billing Admin"],
      name: "app.settings.subscription.delete",
      description: "Cancel subscription",
      type: "app",
    },
    {
      inRoles: [DefaultAppRoles.SuperUser, "Admin", "Billing Admin"],
      name: "app.settings.subscription.invoices.view",
      description: "Views invoices",
      type: "app",
    },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.account.view", description: "View account settings page", type: "app" },
    {
      inRoles: [DefaultAppRoles.SuperUser, "Admin"],
      name: "app.settings.account.update",
      description: "Update account settings - Name, Slug, and Icon",
      type: "app",
    },
    { inRoles: [DefaultAppRoles.SuperUser], name: "app.settings.account.delete", description: "Delete account", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.linkedAccounts.view", description: "View linked accounts page", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.linkedAccounts.create", description: "Create linked account", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.linkedAccounts.delete", description: "Delete linked account", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.apiKeys.view", description: "View API Keys page", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.apiKeys.create", description: "Create API Key", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.apiKeys.update", description: "Update API Key", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.apiKeys.delete", description: "Delete API Key", type: "app" },
    { inRoles: [DefaultAppRoles.SuperUser, "Admin"], name: "app.settings.auditTrails.view", description: "View Audit Trails page", type: "app" },
  ];

  await createPermissions(appPermissions);

  const entities = await getAllEntities(true);
  await Promise.all(
    entities.map(async (entity) => {
      return (await getEntityPermissions(entity)).map(async (permission) => {
        const entityPermission = {
          inRoles: [DefaultAdminRoles.SuperAdmin, DefaultAppRoles.SuperUser, "Admin", "User"],
          name: permission.name,
          description: permission.description,
          type: entity.isDefault ? "admin" : "app",
        };
        appPermissions.push(entityPermission);
        return await createPermissions([entityPermission], appPermissions.length + 1);
      });
    })
  );

  const users = (await adminGetAllUsers()).items;
  await Promise.all(
    users
      .filter((f) => f.admin)
      .map(async (user) => {
        adminRoles.map(async (adminRole) => {
          if (user.email === process.env.ADMIN_EMAIL || adminRole.assignToNewUsers) {
            return await createUserRole(user.id, adminRole.id);
          }
        });
      })
  );

  const tenants = await adminGetAllTenants();
  await Promise.all(
    tenants.map(async (tenant) => {
      tenant.users.map(async (tenantUser) => {
        appRoles.map(async (appRole) => {
          return await createUserRole(tenantUser.userId, appRole.id, tenant.id);
        });
      });
    })
  );

  const guestRole = await getRoleByName("Guest");
  if (guestRole) {
    const viewAndReadPermissions = (await getAllPermissions()).filter((f) => f.name.includes(".view") || f.name.includes(".read"));
    await Promise.all(
      viewAndReadPermissions.map(async (permission) => {
        return await createRolePermission({
          roleId: guestRole.id,
          permissionId: permission.id,
        });
      })
    );
  }
}

async function seedRoles(roles: { name: string; description: string; type: "admin" | "app"; assignToNewUsers: boolean }[]) {
  return await Promise.all(
    roles.map(async (data, idx) => {
      const role = await createRole({
        ...data,
        order: idx + 1,
        isDefault: true,
      });
      await new Promise((r) => setTimeout(r, 10));
      return role;
    })
  );
}

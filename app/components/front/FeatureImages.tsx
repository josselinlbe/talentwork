import Carousel from "../ui/images/Carousel";

const featureImages = [
  {
    group: "Admin Portal",
    title: "Admin Dashboard",
    route: "/admin/dashboard",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/dashboard.png",
  },
  {
    group: "Admin Portal",
    title: "Users",
    route: "/admin/users",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/users.png",
  },
  {
    group: "Admin Portal",
    title: "Accounts",
    route: "/admin/accounts",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/tenants.png",
  },
  {
    group: "Admin Portal",
    title: "Blogging",
    route: "/admin/blog",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/blog.png",
  },
  {
    group: "Admin Portal",
    title: "Entities",
    route: "/admin/entities",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/entities.png",
  },
  {
    group: "Admin Portal",
    title: "Admin API Keys",
    route: "/admin/api/keys",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/api-keys.png",
  },
  {
    group: "Admin Portal",
    title: "Admin API Logs",
    route: "/admin/api/logs",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/api-logs.png",
  },
  {
    group: "Admin Portal",
    title: "Admin Audit Trails",
    route: "/admin/audit-trails",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/audit-trails.png",
  },
  {
    group: "Admin Portal",
    title: "Set up Pricing Plans",
    route: "/admin/setup/pricing",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/setup-pricing.png",
  },
  {
    group: "Admin Portal",
    title: "Set up Email Templates",
    route: "/admin/setup/emails",
    src: "https://yahooder.sirv.com/saasrock/features/admin-portal/setup-emails.png",
  },
  {
    group: "App Portal",
    title: "App Dashboard",
    route: "/app/dashboard",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/dashboard.png",
  },
  {
    group: "App Portal",
    title: "Command Palette",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/command-palette.png",
  },
  {
    group: "App Portal",
    title: "Profile",
    route: "/app/acme-corp-1/settings/profile",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/profile.png",
  },
  {
    group: "App Portal",
    title: "Members",
    route: "/app/acme-corp-1/settings/members",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/members.png",
  },
  {
    group: "App Portal",
    title: "Subscription",
    route: "/app/acme-corp-1/settings/subscription",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/subscription.png",
  },
  {
    group: "App Portal",
    title: "Linked Accounts",
    route: "/app/acme-corp-1/settings/linked-accounts",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/linked-accounts.png",
  },
  {
    group: "App Portal",
    title: "Account",
    route: "/app/acme-corp-1/settings/account",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/account.png",
  },
  {
    group: "App Portal",
    title: "API Keys",
    route: "/app/acme-corp-1/settings/api/keys",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/api-keys.png",
  },
  {
    group: "App Portal",
    title: "API Logs",
    route: "/app/acme-corp-1/settings/api/logs",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/api-logs.png",
  },
  {
    group: "App Portal",
    title: "Tenant Audit Trails",
    route: "/app/acme-corp-1/settings/audit-trails",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/audit-trails.png",
  },
  {
    group: "App Portal",
    title: "Switch Account",
    route: "/app",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/select-account.png",
  },
  {
    group: "App Portal",
    title: "New Account",
    route: "/app/new-account",
    src: "https://yahooder.sirv.com/saasrock/features/app-portal/new-account.png",
  },
  {
    group: "Authentication",
    title: "Login",
    route: "/login",
    src: "https://yahooder.sirv.com/saasrock/features/authentication/login.png",
  },
  {
    group: "Authentication",
    title: "Register",
    route: "/register",
    src: "https://yahooder.sirv.com/saasrock/features/authentication/register.png",
  },
  {
    group: "Authentication",
    title: "Forgot Password",
    route: "/forgot-password",
    src: "https://yahooder.sirv.com/saasrock/features/authentication/forgot-password.png",
  },
  {
    group: "Authentication",
    title: "Reset",
    route: "/reset",
    src: "https://yahooder.sirv.com/saasrock/features/authentication/reset-password.png",
  },
  {
    group: "Subscriptions",
    title: "Pricing",
    route: "/pricing",
    src: "https://yahooder.sirv.com/saasrock/features/subscriptions/pricing.png",
  },
  {
    group: "Subscriptions",
    title: "My Subscription",
    route: "/app/acme-corp-1/settings/subscription",
    src: "https://yahooder.sirv.com/saasrock/features/subscriptions/my-subscription.png",
  },
  {
    group: "Subscriptions",
    title: "Tenant Subscription",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/subscriptions/tenant-subscription.png",
  },
  {
    group: "Subscriptions",
    title: "Subscription Plans",
    route: "/admin/setup/pricing",
    src: "https://yahooder.sirv.com/saasrock/features/subscriptions/subscription-plans.png",
  },
  {
    group: "Subscriptions",
    title: "Create Subscription Plan",
    route: "/admin/setup/pricing/new",
    src: "https://yahooder.sirv.com/saasrock/features/subscriptions/create-subscription-plan.png",
  },
  {
    group: "Blogging",
    title: "Blog",
    route: "/blog",
    src: "https://yahooder.sirv.com/saasrock/features/blogging/blog.png",
  },
  {
    group: "Blogging",
    title: "Blog Posts",
    route: "/admin/blog",
    src: "https://yahooder.sirv.com/saasrock/features/blogging/blog-posts.png",
  },
  {
    group: "Blogging",
    title: "New Blog Post",
    route: "/admin/blog/new",
    src: "https://yahooder.sirv.com/saasrock/features/blogging/new-blog-post.png",
  },
  {
    group: "Blogging",
    title: "Blog Post",
    route: "/blog/7-things-i-ve-learned-using-remix-for-1-month",
    src: "https://yahooder.sirv.com/saasrock/features/blogging/blog-post.png",
  },
  {
    group: "Audit Trails",
    title: "Admin Audit Trails",
    route: "/admin/audit-trails",
    src: "https://yahooder.sirv.com/saasrock/features/audit-trails/admin.png",
  },
  {
    group: "Audit Trails",
    title: "Tenant Audit Trails",
    route: "/app/acme-corp-1/settings/audit-trails",
    src: "https://yahooder.sirv.com/saasrock/features/audit-trails/tenant.png",
  },
  {
    group: "Audit Trails",
    title: "API Audit Trails",
    route: "/admin/api/logs",
    src: "https://yahooder.sirv.com/saasrock/features/audit-trails/api.png",
  },
  {
    group: "Entity Builder",
    title: "Entities",
    route: "/admin/entities",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/entities.png",
  },
  {
    group: "Entity Builder",
    title: "Entity Details",
    route: "/admin/entities/employees/details",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/entity-details.png",
  },
  {
    group: "Entity Builder",
    title: "Entity Properties",
    route: "/admin/entities/employees/properties",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/properties.png",
  },
  {
    group: "Entity Builder",
    title: "New Property",
    route: "/admin/entities/employees/properties/new",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/new-property.png",
  },
  {
    group: "Entity Builder",
    title: "Admin Entity Rows View",
    route: "/admin/entities/employees/logs",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/admin-rows-logs.png",
  },
  {
    group: "Entity Builder",
    title: "Admin Entity Rows Logs",
    route: "/admin/entities/employees/rows",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/admin-rows-view.png",
  },
  {
    group: "Entity Builder",
    title: "Entity Webhooks",
    route: "/admin/entities/employees/webhooks",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/webhooks.png",
  },
  {
    group: "Entity Builder",
    title: "Entity API Docs (UNDER CONSTRUCTION)",
    route: "/admin/entities/employees/api",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/api.png",
  },
  {
    group: "Entity Builder",
    title: "Autogenerated Table View",
    route: "/app/acme-corp-1/employees",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/table-view.png",
  },
  {
    group: "Entity Builder",
    title: "Autogenerated Create Form",
    route: "/app/acme-corp-1/employees/new",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/create-form.png",
  },
  {
    group: "Entity Builder",
    title: "Autogenerated Detail/Edit View and Form",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/details-view-and-form.png",
  },
  {
    group: "Entity Builder",
    title: "Tenant Entity Row Logs",
    route: "/app/acme-corp-1/settings/audit-trails",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/rows-logs.png",
  },
  {
    group: "Entity Builder",
    title: "API Usage",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/entity-builder/api-usage.png",
  },
  {
    group: "Webhooks",
    title: "New Entity Webhook",
    route: "/admin/entities/employees/webhooks/new",
    src: "https://yahooder.sirv.com/saasrock/features/webhooks/new-webhook.png",
  },
  {
    group: "Webhooks",
    title: "Webhooks by Zapier Set up",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/webhooks/zapier.png",
  },
  {
    group: "Webhooks",
    title: "Add created entity rows to Google Sheets",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/webhooks/google-sheets.png",
  },
  {
    group: "API",
    title: "GET - Get all entity rows",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/api/get.png",
  },
  {
    group: "API",
    title: "POST - Create entity row",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/api/post.png",
  },
  {
    group: "API",
    title: "GET - Get entity row",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/api/get-id.png",
  },
  {
    group: "API",
    title: "PUT - Update entity row",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/api/put.png",
  },
  {
    group: "API",
    title: "DELETE - Delete entity row",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/api/delete.png",
  },
  {
    group: "API",
    title: "API Logs",
    route: "/app/acme-corp-1/settings/api/logs",
    src: "https://yahooder.sirv.com/saasrock/features/api/logs.png",
  },
  {
    group: "Roles & Permissions",
    title: "Roles",
    route: "/admin/roles-and-permissions/roles",
    src: "https://user-images.githubusercontent.com/8606530/174460485-0c17e2bb-1eb7-490b-8e6e-1546770401d7.png",
  },
  {
    group: "Roles & Permissions",
    title: "Permissions",
    route: "/admin/roles-and-permissions/permissions",
    src: "https://user-images.githubusercontent.com/8606530/174460558-589ac602-2061-4fe6-a9a0-e734f75269b4.png",
  },
  {
    group: "Roles & Permissions",
    title: "Set Admin Roles",
    route: "/admin/roles-and-permissions/admin-users",
    src: "https://user-images.githubusercontent.com/8606530/174461740-65b264ce-38f4-4e82-a6a9-77bd123a0deb.png",
  },
  {
    group: "Roles & Permissions",
    title: "Set Account User Roles",
    route: "/admin/roles-and-permissions/account-users",
    src: "https://user-images.githubusercontent.com/8606530/174460587-ef90a695-1fcd-4ddb-af9b-641c27a73481.png",
  },
  {
    group: "Row-level Visibility & Permissions",
    title: "Groups",
    route: "",
    src: "https://user-images.githubusercontent.com/8606530/174460615-a20dbedc-bdbf-4248-91dc-f86002aac812.png",
  },
  {
    group: "Row-level Visibility & Permissions",
    title: "Row visibility - Private (only you)",
    route: "",
    src: "https://user-images.githubusercontent.com/8606530/174460688-7069d654-ce39-4b55-8777-69e17a69c315.png",
  },
  {
    group: "Row-level Visibility & Permissions",
    title: "Row visibility - Share to Account Members",
    route: "",
    src: "https://user-images.githubusercontent.com/8606530/174460695-4de0bf14-7e95-46e0-9852-9cacb92f55fa.png",
  },
  {
    group: "Row-level Visibility & Permissions",
    title: "Row visibility - Share to Specific Groups",
    route: "",
    src: "https://user-images.githubusercontent.com/8606530/174460699-9a149df9-7406-4fe6-923d-9cb04560395d.png",
  },
  {
    group: "Row-level Visibility & Permissions",
    title: "Row visibility - Share to Specific Users",
    route: "",
    src: "https://user-images.githubusercontent.com/8606530/174460705-ec683416-2ac1-4efb-91da-4de152e88459.png",
  },
  {
    group: "Row-level Visibility & Permissions",
    title: "Row visibility - Set Public",
    route: "",
    src: "https://user-images.githubusercontent.com/8606530/174460711-ac9beeca-6af9-4a6e-959d-5b03a744b9ee.png",
  },
  {
    group: "Row-level Visibility & Permissions",
    title: "Public row view",
    route: "",
    src: "https://user-images.githubusercontent.com/8606530/174460727-d2a10e3e-70a1-46c1-b5f2-e558ee6e840a.png",
  },
  {
    group: "Events and Webhooks",
    title: "Events Route",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/events-and-webhooks/events.png",
  },
  {
    group: "Events and Webhooks",
    title: "Event",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/events-and-webhooks/event.png",
  },
  {
    group: "Events and Webhooks",
    title: "Event Details",
    route: "",
    src: "https://yahooder.sirv.com/saasrock/features/events-and-webhooks/event-details.png",
  },
];
export default function FeatureImages() {
  return (
    <div className="relative overflow-hidden pt-2">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-5xl space-y-8">
        <div>
          <h2 className="text-base font-semibold tracking-wider text-theme-600 uppercase">Don't build from scratch</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">+70 SaaS-ready pages</p>
          <p className="mt-5 max-w-prose mx-auto text-base text-gray-500">
            Marketing pages (Landing, Blog, Pricing), App pages (Dashboard, Account Settings), and Admin pages (Tenant/Users, Pricing, Entity Builder, Blog
            posts, and more).
          </p>
        </div>
        <div className="mx-auto">
          <Carousel images={featureImages} />
        </div>
      </div>
    </div>
  );
}

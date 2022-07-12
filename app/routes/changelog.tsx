import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { i18nHelper } from "~/locale/i18n.utils";
import ChangelogIssues, { ChangelogItem } from "~/components/front/ChangelogIssues";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  items: ChangelogItem[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t, translations } = await i18nHelper(request);

  const changelogItems: ChangelogItem[] = [
    {
      date: "Jul 11, 2022",
      releaseTag: "0.4.0",
      title: "SaasRock v0.4.0 - Events and Webhooks",
      description: "Use the Events to log essential data and use Webhooks to customize your business logic within internal or external webhooks.",
      url: "https://alexandro.dev/saasrock-v0-4-0-events-and-webhooks",
      videos: [
        {
          title: "Building a SaaS with SaasRock - Day 1 - Set up and the Taxpayers model",
          url: "https://www.youtube.com/embed/FyQvTxyl7LI",
        },
        {
          title: "Building a SaaS with SaasRock - Day 2 - Postmark, Supabase and ngrok",
          url: "https://www.youtube.com/embed/GBNe8xm6FRo",
        },
        {
          title: "Building a SaaS with SaasRock - Day 3 - Custom routes for List view and New form",
          url: "https://www.youtube.com/embed/8LFbl0uuDO8",
        },
        {
          title: "Deploying your SaasRock app to Vercel and Supabase",
          url: "https://www.youtube.com/embed/d9QUBcNVZyU",
        },
        {
          title: "Events and Webhooks - Customize your SaaS business logic or connect with Zapier!",
          url: "https://www.youtube.com/embed/YLw_6Lb0Bqg",
        },
      ],
      added: [
        {
          title: "Manage API entities as administrator #124",
          img: [
            {
              title: "Manage API entities as administrator",
              img: "https://yahooder.sirv.com/saasrock/changelog/0.4.0/entities-api.png",
            },
          ],
        },
      ],
      closed: [
        {
          title: "Events and Webhooks #125",
          img: [
            {
              title: "Application Events",
              img: "https://user-images.githubusercontent.com/8606530/178308128-52eb5f42-df05-41d7-9b80-b843e815821b.png",
            },
            {
              title: "Events Route",
              img: "https://user-images.githubusercontent.com/8606530/178391679-e5023faf-3650-45e3-b198-bf0359a06ba6.png",
            },
            {
              title: "Event Details Route",
              img: "https://user-images.githubusercontent.com/8606530/178391754-434e378a-a88f-47d2-b9b9-c2cd29628f4d.png",
            },
          ],
        },
        {
          title: "Property Attributes in separate model + UI Tests #123",
          img: [
            {
              title: "Property options with description",
              img: "https://yahooder.sirv.com/saasrock/changelog/0.4.0/property-attributes-model.png",
            },
          ],
        },
        {
          title: "Property options with description #121",
          img: [
            {
              title: "Property options with description",
              img: "https://user-images.githubusercontent.com/8606530/177469142-4cf562c7-4f8a-4ece-aeed-e2d3671e8feb.png",
            },
          ],
        },
        {
          title: "HTML attributes Mix, Min, Rows, Rows, DefaultValue for certain Property Types #120",
          img: [
            { title: "Text UI", img: "https://user-images.githubusercontent.com/8606530/177437022-41398ef7-e586-4435-b5b5-65e1f4c35c68.png" },
            { title: "Text API", img: "https://user-images.githubusercontent.com/8606530/177437044-3332a0b2-d936-416e-8962-cbaf887d3508.png" },
            { title: "Number UI", img: "https://user-images.githubusercontent.com/8606530/177437504-8d3fb00e-d46a-499c-ac35-8edacaa57b8d.png" },
            { title: "Number API", img: "https://user-images.githubusercontent.com/8606530/177437080-6187eb51-84b3-41cc-a2da-0ccec5a13dab.png" },
            { title: "Media UI", img: "https://user-images.githubusercontent.com/8606530/177437115-a94aaefa-b548-42d1-bfd6-c1370a3b3710.png" },
            { title: "Media API", img: "https://user-images.githubusercontent.com/8606530/177437408-76131185-f047-4c57-b197-4d5650a2cc5d.png" },
          ],
        },
      ],
    },
    {
      date: "Jul 03, 2022",
      releaseTag: "0.3.2",
      title: "SaasRock v0.3.2 - Row Filters, Tags, Tasks, Comments, Workflows, Kanban Board and API limits",
      description:
        "The entity builder just got stronger with a lot of new features for every created Row. Plus a kanban board component and API limits based on the account's subscription.",
      url: "https://alexandro.dev/saasrock-v0-3-2-row-filters-tags-tasks-comments-and-workflows",
      added: [
        {
          title: "Admin should be able to manually change the plan for all accounts #104",
        },
        {
          title: "Single Sign On #105",
        },
        {
          title: "Missing the currency on the pricing #106",
        },
        {
          title: "Improve Registration/Onboarding #109",
        },
        {
          title: "Limit the users (anti-scraping) #111",
        },
        {
          title: "Affiliate Management #113",
        },
        {
          title: "Deploy with Docker #114",
        },
        {
          title: "Use Supabase API for file storage (RowValueMedia) #115",
        },
        {
          title: "Entities Import & Export CSV #116",
        },
      ],
      closed: [
        {
          title: "Entity Row Filters by URL, Tags, Tasks, Comments, and Workflow #119",
          img: [
            { title: "Filters", img: "https://user-images.githubusercontent.com/8606530/177080781-969bcbdf-972d-4bc7-9ae0-fa143c900709.png" },
            {
              title: "Tags, Tasks, Comments, and Workflow",
              img: "https://user-images.githubusercontent.com/8606530/177080814-9d22eb29-4cd4-4942-ae41-2821ad2f1ec5.png",
            },
          ],
        },
        {
          title: "URL filters for /admin/accounts,users,roles,permissions #118",
          img: [
            { title: "Accounts", img: "https://user-images.githubusercontent.com/8606530/177056635-5967f467-fd2b-487e-b2c4-3ea5854f6fd7.png" },
            { title: "Users", img: "https://user-images.githubusercontent.com/8606530/177056526-b44848ad-8681-4827-a803-99badc3edfc9.png" },
            { title: "Roles", img: "https://user-images.githubusercontent.com/8606530/177056536-25dc094b-67e6-4726-9005-1d11c3c29f66.png" },
            { title: "Permissions", img: "https://user-images.githubusercontent.com/8606530/177056545-0098015e-1c18-4f05-a423-66bd206948ec.png" },
          ],
        },
        {
          title: "Upgrade remix to 1.6 #117",
        },
        {
          title: "No se pueden asignar imágenes a un campo de una entidad si hay varios campos de imágenes #110",
          img: [
            { title: "Multiple Media Properties", img: "https://user-images.githubusercontent.com/8606530/177079130-b10eb38e-fa03-4fb0-a6d1-90629cda7dce.png" },
          ],
        },
        {
          title: "Update Guide #107",
        },
        {
          title: "API Key Limits should have configurable interval #101",
          img: [
            {
              title: "API Key Limits should have configurable interval",
              img: "https://user-images.githubusercontent.com/8606530/177079642-f6c76113-dab8-4484-9feb-6219b4e0b98f.png",
            },
          ],
        },
        {
          title: "Enable no expiration for API Keys #93",
          img: [
            {
              title: "Enable no expiration for API Keys",
              img: "https://user-images.githubusercontent.com/8606530/177079468-e618e10c-e325-40f6-89d6-a86353eb4732.png",
            },
          ],
        },
        {
          title: "Plan Limits for API Keys and Usage #92",
          img: [
            {
              title: "Plan Limits for API Keys and Usage",
              img: "https://user-images.githubusercontent.com/8606530/177079403-ae152b1b-798f-4a33-a963-d353df944caa.png",
            },
          ],
        },
        {
          title: "Entity Details Views: Page (default) and Modal #91",
          img: [
            {
              title: "Entity Details Views: Page (default) and Modal",
              img: "https://user-images.githubusercontent.com/8606530/177080814-9d22eb29-4cd4-4942-ae41-2821ad2f1ec5.png",
            },
          ],
        },
        {
          title: "Entity Form Views: Page (default) and Modal #90",
          img: [
            {
              title: "Entity Form Views: Page (default) and Modal",
              img: "https://user-images.githubusercontent.com/8606530/177079763-34d763aa-db63-43d9-a4b0-1b401d8a73a4.png",
            },
          ],
        },
        {
          title: "Entity List Views: Table and Kanban board (with Pagination?, show/hide columns, default filters…) #89",
          img: [
            {
              title: "Entity List Views: Table and Kanban board",
              img: "https://user-images.githubusercontent.com/8606530/177079999-769bedd3-e7c1-4d72-b8bf-5d5a75711dfd.png",
            },
          ],
        },
        {
          title: "Dashboard → Entity stat #78",
        },
        {
          title: "Add Module: Workflows with Custom Forms and Custom Fields #11",
          img: [
            {
              title: "Workflows",
              img: "https://user-images.githubusercontent.com/8606530/177080103-c96ef433-c1cb-48eb-ba6f-72f57acfd195.png",
            },
          ],
        },
      ],
    },
    {
      date: "Jun 18, 2022",
      releaseTag: "0.2.7",
      title: "Roles, Permissions, Groups, and Row-level visibility",
      description:
        "Added admin and application Roles & Permissions for page views and actions. Added application Groups and Row-level visibility - only you, public, or share with account members, groups, or specific users.",
      url: "/blog/saasrock-v0-2-7-roles-permissions-groups-and-row-level-visibility",
      added: [
        {
          title: "API Key Limits should have configurable interval #101",
          img: [
            { title: "API key interval limits", img: "https://user-images.githubusercontent.com/4130910/172677467-470a266e-63fb-47c2-8a06-c9617253ced2.png" },
          ],
        },
        {
          title: "Custom code #96",
          img: [{ title: "Custom code example", img: "https://user-images.githubusercontent.com/15314417/172010302-a3405271-de25-4eaa-b5a7-6ac0dbac87d2.png" }],
        },
        {
          title: "Parallelize database calls #94",
          img: [
            {
              title: "Parallelize database calls example",
              img: "https://user-images.githubusercontent.com/104298806/171969644-f7be1516-d1c7-47b5-b588-c94250a75ac7.png",
            },
          ],
        },
      ],
      closed: [
        {
          title: "Add Page: Roles and User roles #14",
          img: [
            { title: "Roles", img: "https://user-images.githubusercontent.com/8606530/174460485-0c17e2bb-1eb7-490b-8e6e-1546770401d7.png" },
            { title: "Permission", img: "https://user-images.githubusercontent.com/8606530/174460558-589ac602-2061-4fe6-a9a0-e734f75269b4.png" },
            { title: "Set Admin Roles", img: "https://user-images.githubusercontent.com/8606530/174460561-7e2f1636-c27b-41cf-b742-deff262001ec.png" },
            { title: "Set App/Account Roles", img: "https://user-images.githubusercontent.com/8606530/174460587-ef90a695-1fcd-4ddb-af9b-641c27a73481.png" },
          ],
        },
        {
          title: "Add Page: Object-level permissions (Create, Read, Update, Delete) #15",
          img: [
            { title: "Groups", img: "https://user-images.githubusercontent.com/8606530/174460615-a20dbedc-bdbf-4248-91dc-f86002aac812.png" },
            { title: "Private (default)", img: "https://user-images.githubusercontent.com/8606530/174460688-7069d654-ce39-4b55-8777-69e17a69c315.png" },
            { title: "Share to Account Members", img: "https://user-images.githubusercontent.com/8606530/174460695-4de0bf14-7e95-46e0-9852-9cacb92f55fa.png" },
            { title: "Share to Specific Groups", img: "https://user-images.githubusercontent.com/8606530/174460699-9a149df9-7406-4fe6-923d-9cb04560395d.png" },
            { title: "Share to Specific Users", img: "https://user-images.githubusercontent.com/8606530/174460705-ec683416-2ac1-4efb-91da-4de152e88459.png" },
            { title: "Set Public", img: "https://user-images.githubusercontent.com/8606530/174460711-ac9beeca-6af9-4a6e-959d-5b03a744b9ee.png" },
            { title: "Public row view", img: "https://user-images.githubusercontent.com/8606530/174460727-d2a10e3e-70a1-46c1-b5f2-e558ee6e840a.png" },
          ],
        },
        {
          title: "Rename the 'tenant' nomenclature to 'account' #52",
        },
      ],
    },
    {
      date: "May 31, 2022",
      releaseTag: "0.2.6",
      title: "Entity Builder + Per-seat Plans + Docs",
      description:
        "Custom Entities with Autogenerated Views/Forms and API. Integrate with other apps using Webhooks. Added the PER_SEAT pricing model. Added /documentation pages.",
      url: "https://dev.to/alexandromtzg/saasrock-the-remix-saas-kit-may-2022-product-update-4i1p",
      added: [
        { title: "Enable no expiration for API Keys #93" },
        { title: "Plan Limits for API Keys and Usage #92" },
        { title: "Entity Details Views: Page (default) and Modal #91" },
        { title: "Entity Form Views: Page (default) and Modal #90" },
        { title: "Entity List Views: Table and Kanban board (with Pagination?, show/hide columns, default filters…) #89" },
        { title: "TopBanner per-page manager, e.g. Pre-launch pricing! #88" },
        { title: "Log button clicks #87" },
        { title: "Log page views #86" },
        { title: "Let the Admin change the Tenant/Account alias, e.g. Company #85" },
        { title: "More entity property variants #84" },
        { title: "Table: Query text with URL debounce #83" },
        { title: "Feedback page: Let tenants submit and vote ideas, e.g. feedback.canny.io #82" },
        { title: "Documentation → how to gen icons #80" },
        { title: "Dashboard → Entity stat #78" },
        { title: "Create API Key as User -> 404 #76" },
        {
          title: "Better design for login and registration #72",
        },
        {
          title: "CRUD for blog authors and categories #71",
        },
        {
          title: "Add dynamic translations #69",
        },
        {
          title: "A table to log the IPs of the tenants #68",
        },
        {
          title: "Portuguese translations #66",
        },
        {
          title: "German translations #65",
        },
        {
          title: "Add Plan Feature Limit: Usage-based #64",
        },
        {
          title: "French translations #63",
        },
        {
          title: "Open API / Swagger Spec Generation #60",
        },
        {
          title: "Blog Content Editor #59",
        },
        {
          title: "Carry Dark / Light Theme Through to App #56",
        },
        {
          title: "SEO - schema.org and sitemap #55",
        },
        {
          title: "Social Auth & Magic Link #45",
        },
      ],
      closed: [
        {
          title: "Rebranding",
          img: [{ title: "Rebranding", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/rebranding.png" }],
        },
        {
          title: "Testimonials",
          img: [{ title: "Testimonials", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/testimonials.png" }],
        },
        {
          title: "Upcoming Features",
          img: [{ title: "Upcoming Features", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/upcoming-features.png" }],
        },
        {
          title: "Pricing CTA",
          img: [{ title: "Pricing CTA", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/pricing-cta.png" }],
        },
        {
          title: "Newsletter",
          img: [{ title: "Newsletter", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/newsletter.png" }],
        },
        {
          title: "Entity Builder #41",
          img: [{ title: "/admin/entities", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/entity-builder.png" }],
        },
        {
          title: "Autogenerated Views and Forms",
          img: [
            { title: "Autogenerated Views", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/autogenerated-view.png" },
            { title: "Autogenerated Forms", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/autogenerated-form.png" },
            { title: "Autogenerated Detail View", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/autogenerated-view-and-form.png" },
          ],
        },
        {
          title: "Autogenerated API",
          img: [{ title: "GET API request", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/autogenerated-api.png" }],
        },
        {
          title: "Entity Webhooks",
          img: [{ title: "New Entity Webhook", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/entity-webhooks.png" }],
        },
        {
          title: "Plan Entity Limits",
          img: [
            { title: "Features", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/plan-entity-limits-features.png" },
            { title: "Limit Reached", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/plan-entity-limits-reached.png" },
          ],
        },
        {
          title: "Per-seat Pricing Model",
          img: [{ title: "Per-seat Pricing Model", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/per-seat-pricing-model.png" }],
        },
        {
          title: "Documentation",
          img: [{ title: "/documentation", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/documentation.png" }],
        },
      ],
    },
    {
      date: "April 28, 2022",
      releaseTag: "0.2.5",
      title: "Blogging",
      description: "Added /blog, /blog/:slug, /admin/blog and /admin/blog/new.",
      url: "https://dev.to/alexandromtzg/remix-saas-kit-changelog-4-blogging-4n70",
      added: [],
      closed: [
        {
          title: "Add Page: Blog #12",
          img: [
            { title: "/blog", img: "https://yahooder.sirv.com/saasrock/blog/may-2022-update/autogenerated-api.png" },
            { title: "/admin/blog", img: "https://user-images.githubusercontent.com/8606530/165638982-0689a332-9658-4c1a-92ec-e2408a160a67.png" },
            { title: "/admin/blog/new", img: "https://user-images.githubusercontent.com/8606530/165643515-c26bc41f-9247-4e9a-8c67-d623124ff2f4.png" },
            { title: "/blog/:slug", img: "https://user-images.githubusercontent.com/8606530/165643892-6279cc94-3b13-405b-af08-a1a9c1c7d2d5.png" },
          ],
        },
      ],
    },
    {
      date: "April 19, 2022",
      releaseTag: "0.2.3",
      title: "Custom Pricing Plans builder",
      description: "Now you can create subscription plans with: Title, Badge, Description, Features, and Monthly/Yearly Price.",
      url: "https://dev.to/alexandromtzg/remix-saas-kit-changelog-3-custom-pricing-plan-builder-28cp",
      added: [
        {
          title: "Epic Feature: Entity Builder #41",
          img: [],
        },
      ],
      closed: [
        {
          title: "Create custom pricing plans #40",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/164090549-df28b2a1-2fff-4e83-9f51-e6f0d05fed77.png" }],
        },
        {
          title: "Delete a Tenant as Admin #37",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/164090789-800e1c40-a804-4b07-ab03-24107ace5e0b.png" }],
        },
      ],
    },
    {
      date: "April 12, 2022",
      title: "Tenant on URL",
      releaseTag: "0.2.2",
      description: "Now you can access the tenant with the URL, and added App/Admin Command palettes, Dashboards, and User events.",
      url: "https://dev.to/alexandromtzg/remix-saas-kit-changelog-2-tenant-on-url-command-palette-dashboards-and-user-events-45b1",
      added: [
        {
          title: "Feature flags #19",
          img: [],
        },
        {
          title: "Add Module (a minimal version): Support Desk #20",
          img: [],
        },
        {
          title: "Add Module (a minimal version): CRM #21",
          img: [],
        },
        {
          title: "Add Module (a minimal version): Email #22",
          img: [],
        },
        {
          title: "Add multiple Admin users #28",
          img: [],
        },
        {
          title: "API Keys for end-users #29",
          img: [],
        },
      ],
      closed: [
        {
          title: "Remove TenantSelector and WorkspaceSelector and have {tenantId}/{workspaceId} on the URL #13",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162983102-142dc22c-f2f5-491f-a463-7904bf22220c.png" }],
        },
        {
          title: "Extend command palette #18",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162983412-baa7de1f-60a3-4554-bd08-1774cfd1d646.png" }],
        },
        {
          title: "Add Page: Admin dashboard with indicators #23",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162983569-bd1f8979-0f4b-4928-812d-c6dd23f8a185.png" }],
        },
        {
          title: "Tenant with their own alias instead of cuid on the URL #24",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162983928-0cae787f-dc8e-4701-bf2f-a51dd7c4b0e4.png" }],
        },
        {
          title: "Add user activity logs #27",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162984096-5272af36-af99-4cd9-8117-e36d9772f7a6.png" }],
        },
        {
          title: "Modify Subscriptions on Tenants as Admin #30",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/162986904-5e3a9679-2795-4206-8a5e-7c9d5353c401.png" }],
        },
      ],
    },
    {
      date: "April 4, 2022",
      title: "Vercel deployment + i18n",
      description: "Demo deployed on Vercel, and added Locale Selector, Page Loading component and more.",
      url: "https://dev.to/alexandromtzg/remix-saas-kit-changelog-1-34b6",
      added: [
        {
          title: "Upgrade to React 18 #6",
        },
        {
          title: "Make fewer database calls #7",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161167627-1e8c2407-fea2-4bb4-81d5-2542f7a02ac4.png" }],
        },
        {
          title: "Add Component: GDPR cookie consent page and banner #9",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161302746-cb149b4e-7f67-46d7-8a46-7c4459a76bf9.png" }],
        },
        {
          title: "Add Module: Workflows with Custom Forms and Custom Fields #11",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161357823-5337a976-0b8a-4a88-8ca9-b6a8f3a85299.png" }],
        },
        {
          title: "Add Page: Blog #12",
        },
        {
          title: "Remove TenantSelector and WorkspaceSelector and have {tenantId}/{workspaceId} on the URL #13",
        },
        {
          title: "Add Page: Roles and User roles #14",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161438663-3805ef3e-3182-4c9f-a279-6d6912e2b6f7.png" }],
        },
        {
          title: "Add Page: Object-level permissions (Create, Read, Update, Delete) #15",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161438749-653823cb-665d-4ba4-8c0d-9fc0d72f4ebf.png" }],
        },
        {
          title: "Remove Postmark hard-coded dependency #16",
        },
      ],
      closed: [
        {
          title: "Vercel deployment not translating with remix-i18next #1",
        },
        {
          title: "Implement a global loading component #2",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161410326-183120dc-7d6a-415f-9b53-c59c0ad76971.png" }],
        },
        {
          title: "Display Stripe invoices #3",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161415542-0080c4ab-66ad-4647-80d7-9e6c1cf87c6d.png" }],
        },
        {
          title: "Add a locale dropdown #4",
          video: "https://www.loom.com/share/1a89140e7b93481bab3cc94b8bb34a57?t=0",
        },
        {
          title: "Mobile site not responsive #5",
        },
        {
          title: "Translate meta titles #10",
        },
        {
          title: "Add /admin/accounts table columns: Workspace, User and Contracts count, Plan, and Revenue #17",
          img: [{ title: "", img: "https://user-images.githubusercontent.com/8606530/161452641-26edcfb0-1ac0-4d72-9de4-339fad73c9ec.png" }],
        },
      ],
    },
  ];

  return json({
    title: `${t("front.changelog.title")} | ${process.env.APP_NAME}`,
    i18n: translations,
    items: changelogItems,
  });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function ChangelogRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <div>
        <Header />
        <div className="bg-white dark:bg-gray-900">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:flex-col sm:align-center">
              <div className="relative max-w-2xl mx-auto py-12 sm:py-6 w-full overflow-hidden px-2">
                <svg className="absolute left-full transform translate-x-1/2" width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true">
                  <defs>
                    <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-black" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
                </svg>
                <svg
                  className="absolute right-full bottom-0 transform -translate-x-1/2"
                  width="404"
                  height="404"
                  fill="none"
                  viewBox="0 0 404 404"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-black" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
                </svg>
                <div className="text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t("front.changelog.title")}</h1>
                  <p className="mt-4 text-lg leading-6 text-gray-500 dark:text-gray-400">{t("front.changelog.headline")}</p>
                </div>
                {/* <div className="flex justify-center mt-6">
                  <Tabs
                    breakpoint="sm"
                    tabs={[
                      {
                        name: t("blog.title"),
                        routePath: "/blog",
                      },
                      {
                        name: t("front.changelog.title"),
                        routePath: "/changelog",
                      },
                      // {
                      //   name: t("front.newsletter.title"),
                      //   routePath: "/newsletter",
                      // },
                      {
                        name: t("front.contact.title"),
                        routePath: "/contact",
                      },
                    ]}
                  />
                </div> */}
                <div className="mt-12 mx-auto">
                  <div className="prose text-sm text-black dark:text-white">
                    {/* <div className=" col-span-1">
                        {data.items.map((item) => {
                          return (
                            <div className="">
                              <a className="text-black dark:text-white" href={"#" + UrlUtils.slugify(item.date, 0)}>
                                {item.date}
                              </a>
                            </div>
                          );
                        })}
                      </div> */}
                    <div className="relative border-l border-gray-200 dark:border-gray-700">
                      {data.items.map((item, idx) => {
                        return (
                          <div key={idx} className="mb-10 ml-4">
                            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                            <time id={UrlUtils.slugify(item.date, 0)} className="text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                              {item.date}{" "}
                              {item.releaseTag && (
                                <span>
                                  -{" "}
                                  <a className="text-gray-500" href={`https://github.com/AlexandroMtzG/saasrock/releases/tag/${item.releaseTag}`}>
                                    v{item.releaseTag}
                                  </a>
                                </span>
                              )}
                            </time>
                            <h2 id={UrlUtils.slugify(item.date, 0)} className="text-black dark:text-white w-full">
                              {item.title}
                            </h2>
                            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{item.description}</p>

                            {/* {item.url && (
                              <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                                {item.url.startsWith("http") ? (
                                  <a href={item.url} className="text-sm">
                                    Read more.
                                  </a>
                                ) : (
                                  <Link to={item.url} className="text-sm">
                                    Read more.
                                  </Link>
                                )}
                              </p>
                            )} */}

                            {item.videos && (
                              <div>
                                <h2 className="text-black dark:text-white font-semibold text-sm">Videos</h2>
                                <ul>
                                  {item.videos.map((video, idx) => {
                                    return (
                                      <li key={idx}>
                                        <a href={video.url} className="text-theme-600 dark:text-theme-400">
                                          🎥 {video.title}
                                        </a>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            <ChangelogIssues title="Done" items={item.closed} icon="✅" />
                            <ChangelogIssues title="Added issues" items={item.added} icon="⌛" />

                            {item.url && (
                              <a
                                href={item.url}
                                className="mt-5 inline-flex items-center py-2 px-4 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-accent-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-200 focus:text-accent-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 no-underline"
                              >
                                Learn more{" "}
                                <svg className="ml-2 w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fillRule="evenodd"
                                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
}

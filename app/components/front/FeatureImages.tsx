import Carousel from "../ui/images/Carousel";

const featureImages = [
  {
    title: "/admin/dashboard",
    route: "/admin/dashboard",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-dashboard.png",
  },
  {
    title: "/admin/users",
    route: "/admin/users",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-users.png",
  },
  {
    title: "/admin/blog",
    route: "/admin/blog",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-blog.png",
  },
  {
    title: "/admin/events",
    route: "/admin/events",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-events.png",
  },
  {
    title: "/admin/setup/pricing",
    route: "/admin/setup/pricing",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-pricing.png",
  },
  {
    title: "/admin/setup/emails",
    route: "/admin/setup/emails",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/admin-emails.png",
  },
  {
    title: "/app/dashboard",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-dashboard.png",
  },
  {
    title: "/app/profile",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-profile.png",
  },
  {
    title: "/app/members",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-members.png",
  },
  {
    title: "/app/subscription",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-subscription.png",
  },
  {
    title: "/app/tenant",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-tenant.png",
  },
  {
    title: "Command Palette",
    src: "https://yahooder.sirv.com/saasfrontends/remix/ss/0.2.5/app-command-palette.png",
  },
];
export default function FeatureImages() {
  return (
    <div className="relative overflow-hidden pt-16">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-5xl space-y-8">
        <div>
          <h2 className="text-base font-semibold tracking-wider text-theme-600 uppercase">Don't build from scratch</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">+40 SaaS-ready pages</p>
          <p className="mt-5 max-w-prose mx-auto text-xl text-gray-500">
            Marketing pages (Landing, Blog, Pricing), App pages (Dashboard, Account Settings), and Admin pages (Tenant/Users, Pricing, Entity Builder, Blog
            posts, and more).
          </p>
        </div>
        <div>
          <Carousel images={featureImages} />
        </div>
      </div>
    </div>
  );
}

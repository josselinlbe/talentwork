import { SubscriptionPrice, SubscriptionProduct, Tenant } from "@prisma/client";
import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import TenantSubscription from "~/components/core/tenants/TenantSubscription";
import { i18n } from "~/locale/i18n.server";
import { getSubscriptionPriceByStripeId } from "~/utils/db/subscriptionProducts.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getStripeSubscription } from "~/utils/stripe.server";

type LoaderData = {
  title: string;
  tenant: Tenant | null;
  subscriptionPrice: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let t = await i18n.getFixedT(request, "translations");
  const tenant = await getTenant(params.id);
  const stripeSubscription = await getStripeSubscription(tenant?.subscriptionId ?? "");
  let tenantSubscription: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null = null;
  if (stripeSubscription && stripeSubscription?.items.data.length > 0) {
    tenantSubscription = await getSubscriptionPriceByStripeId(stripeSubscription?.items.data[0].plan.id);
  }
  const data: LoaderData = {
    title: `${tenant?.name} ${t("admin.tenants.subscription.title")} | ${process.env.APP_NAME}`,
    tenant,
    subscriptionPrice: tenantSubscription,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function AdminTenantSubscriptionRoute() {
  const data = useLoaderData<LoaderData>();

  return <div>{data.tenant && <TenantSubscription tenant={data.tenant} subscriptionPrice={data.subscriptionPrice} />}</div>;
}

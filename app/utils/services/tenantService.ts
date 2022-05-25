import { deleteTenant } from "../db/tenants.db.server";
import { getTenantSubscription } from "../db/tenantSubscriptions.db.server";
import { cancelStripeSubscription } from "../stripe.server";

export async function deleteAndCancelTenant(id: string) {
  const tenantSubscription = await getTenantSubscription(id);
  if (tenantSubscription?.stripeSubscriptionId) {
    await cancelStripeSubscription(tenantSubscription?.stripeSubscriptionId);
  }
  return await deleteTenant(id);
}

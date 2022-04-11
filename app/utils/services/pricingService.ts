import { SubscriptionProductDto } from "../../application/dtos/subscriptions/SubscriptionProductDto";
import { createSubscriptionProduct, createSubscriptionPrice, createSubscriptionFeature } from "../db/subscriptionProducts.db.server";
import { createStripeProduct, createStripePrice } from "../stripe.server";

export async function createPlans(plans: SubscriptionProductDto[]): Promise<void> {
  plans.forEach(async (plan) => {
    // Create stripe product
    const stripeProduct = await createStripeProduct({ title: plan.title });
    // Save to db
    const product = await createSubscriptionProduct({
      stripeId: stripeProduct.id,
      tier: plan.tier,
      title: plan.title,
      description: plan.description,
      badge: plan.badge,
      active: plan.active,
      contactUs: plan.contactUs,
      maxWorkspaces: plan.maxWorkspaces,
      maxUsers: plan.maxUsers,
      maxLinks: plan.maxLinks,
      maxStorage: plan.maxStorage,
      monthlyContracts: plan.monthlyContracts,
    });

    if (!product) {
      throw new Error("Could not create subscription product");
    }

    plan.prices.forEach(async (price) => {
      // Create stripe price
      const stripePrice = await createStripePrice(stripeProduct.id, price);
      // Save to db
      await createSubscriptionPrice({
        ...price,
        subscriptionProductId: product.id,
        stripeId: stripePrice.id,
      });
    });

    plan.features.forEach(async (feature) => {
      // Save to db
      await createSubscriptionFeature({
        ...feature,
        subscriptionProductId: product.id,
      });
    });
  });
}

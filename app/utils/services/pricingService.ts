import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import { SubscriptionProductDto } from "../../application/dtos/subscriptions/SubscriptionProductDto";
import {
  createSubscriptionProduct,
  createSubscriptionPrice,
  createSubscriptionFeature,
  updateSubscriptionProductStripeId,
  updateSubscriptionPriceStripeId,
  deleteSubscriptionPrice,
  deleteSubscriptionProduct,
  updateSubscriptionProduct,
  updateSubscriptionFeature,
} from "../db/subscriptionProducts.db.server";
import { createStripeProduct, createStripePrice, updateStripePrice, deleteStripeProduct, updateStripeProduct } from "../stripe.server";

export async function createPlans(plans: SubscriptionProductDto[]): Promise<void> {
  plans.map(async (plan) => {
    await createPlan(plan, plan.prices, plan.features);
  });
}

export async function createPlan(
  plan: SubscriptionProductDto,
  prices: { billingPeriod: SubscriptionBillingPeriod; price: number; currency: string }[],
  features: { order: number; key: string; value: string; included: boolean }[]
) {
  // Create stripe product
  const stripeProduct = await createStripeProduct({ title: plan.translatedTitle ?? plan.title });
  // Save to db
  const product = await createSubscriptionProduct({
    stripeId: stripeProduct?.id ?? "",
    tier: plan.tier,
    title: plan.title,
    description: plan.description,
    badge: plan.badge,
    active: plan.active,
    public: plan.public,
    maxUsers: plan.maxUsers,
    monthlyContracts: plan.monthlyContracts,
  });

  if (!product) {
    throw new Error("Could not create subscription product");
  }

  prices.map(async (price) => {
    // Create stripe price
    const stripePrice = await createStripePrice(stripeProduct?.id ?? "", price);
    // Save to db
    await createSubscriptionPrice({
      ...price,
      subscriptionProductId: product.id,
      stripeId: stripePrice?.id ?? "",
      type: SubscriptionPriceType.RECURRING,
      billingPeriod: price.billingPeriod,
      price: price.price,
      currency: price.currency,
      trialDays: 0,
      active: true,
    });
  });

  features.map(async (feature) => {
    // Save to db
    await createSubscriptionFeature({
      ...feature,
      subscriptionProductId: product.id,
    });
  });
}

export async function syncPlan(
  plan: SubscriptionProductDto,
  prices: { id?: string; billingPeriod: SubscriptionBillingPeriod; price: number; currency: string }[]
) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`);
  }
  const stripeProduct = await createStripeProduct({ title: plan.translatedTitle ?? plan.title });
  if (!stripeProduct) {
    throw new Error("Could not create product");
  }
  await updateSubscriptionProductStripeId(plan.id, {
    stripeId: stripeProduct.id,
  });

  prices.map(async (price) => {
    // Create stripe price
    const stripePrice = await createStripePrice(stripeProduct?.id ?? "", price);
    if (!stripePrice) {
      throw new Error(`Could not create price ${plan.title} - ${price.price}`);
    }
    // Save to db
    await updateSubscriptionPriceStripeId(price.id ?? "", {
      stripeId: stripePrice?.id ?? "",
    });
  });
}

export async function updatePlan(plan: SubscriptionProductDto, features: { id: string; order: number; key: string; value: string; included: boolean }[]) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`);
  }

  await updateStripeProduct(plan.stripeId, { title: plan.translatedTitle ?? plan.title });

  await updateSubscriptionProduct(plan.id, {
    tier: plan.tier,
    title: plan.title,
    description: plan.description,
    badge: plan.badge,
    public: plan.public,
    maxUsers: plan.maxUsers,
    monthlyContracts: plan.monthlyContracts,
  });

  const updateFeatures = features.map(async (feature) => {
    if (feature.id) {
      return await updateSubscriptionFeature(feature.id, {
        ...feature,
      });
    } else {
      return await createSubscriptionFeature({
        ...feature,
        subscriptionProductId: plan.id ?? "",
      });
    }
  });

  return await Promise.all(updateFeatures);
}

export async function deletePlan(plan: SubscriptionProductDto) {
  const deletePrices = plan.prices
    .filter((f) => f.stripeId)
    .map(async (price) => {
      await updateStripePrice(price.stripeId, {
        active: false,
      });

      if (price.id) {
        await deleteSubscriptionPrice(price.id);
      }

      return null;
    });

  await Promise.all(deletePrices);

  if (plan.stripeId) {
    await deleteStripeProduct(plan.stripeId);
  }

  if (plan.id) {
    await deleteSubscriptionProduct(plan.id);
  }
}

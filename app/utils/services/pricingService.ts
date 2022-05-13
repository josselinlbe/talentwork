import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
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
  deleteSubscriptionFeatures,
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
  features: SubscriptionFeatureDto[]
) {
  // Create stripe product
  const stripeProduct = await createStripeProduct({ title: plan.translatedTitle ?? plan.title });
  // Save to db
  const product = await createSubscriptionProduct({
    stripeId: stripeProduct?.id ?? "",
    order: plan.order,
    title: plan.title,
    model: plan.model,
    description: plan.description,
    badge: plan.badge,
    active: plan.active,
    public: plan.public,
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

  features
    .sort((a, b) => a.order - b.order)
    .map(async (feature) => {
      // Save to db
      await createSubscriptionFeature(product.id, feature);
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

export async function updatePlan(plan: SubscriptionProductDto, features: SubscriptionFeatureDto[]) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`);
  }

  await updateStripeProduct(plan.stripeId, { title: plan.translatedTitle ?? plan.title });

  await updateSubscriptionProduct(plan.id, {
    order: plan.order,
    title: plan.title,
    model: plan.model,
    description: plan.description,
    badge: plan.badge,
    public: plan.public,
  });

  await deleteSubscriptionFeatures(plan.id ?? "");

  return await Promise.all(
    features
      .sort((a, b) => a.order - b.order)
      .map(async (feature) => {
        return await createSubscriptionFeature(plan.id ?? "", feature);
      })
  );
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

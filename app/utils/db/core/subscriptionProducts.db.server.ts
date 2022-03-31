import { SubscriptionFeature, SubscriptionPrice, SubscriptionProduct } from ".prisma/client";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { db } from "~/utils/db.server";

export type SubscriptionPriceWithProduct = SubscriptionPrice & {
  subscriptionProduct: SubscriptionProduct;
};

export async function getAllSubscriptionProducts(): Promise<SubscriptionProductDto[]> {
  return await db.subscriptionProduct
    .findMany({
      where: {
        active: true,
      },
      include: {
        prices: true,
        features: true,
      },
      orderBy: {
        tier: "asc",
      },
    })
    .catch(() => {
      return [];
    });
}

export async function getSubscriptionPrice(id: string): Promise<SubscriptionPriceWithProduct | null> {
  return await db.subscriptionPrice
    .findUnique({
      where: { id },
      include: {
        subscriptionProduct: true,
      },
    })
    .catch(() => {
      return null;
    });
}

export async function getSubscriptionPriceByStripeId(stripeId: string): Promise<SubscriptionPriceWithProduct | null> {
  return await db.subscriptionPrice
    .findFirst({
      where: { stripeId },
      include: {
        subscriptionProduct: true,
      },
    })
    .catch(() => {
      return null;
    });
}

export async function createSubscriptionProduct(data: {
  stripeId: string;
  tier: number;
  title: string;
  description: string;
  badge: string;
  active: boolean;
  contactUs: boolean;
  maxWorkspaces: number;
  maxUsers: number;
  maxLinks: number;
  maxStorage: number;
  monthlyContracts: number;
}): Promise<SubscriptionProduct | null> {
  return await db.subscriptionProduct
    .create({
      data,
    })
    .catch(() => {
      return null;
    });
}

export async function createSubscriptionPrice(data: {
  subscriptionProductId: string;
  stripeId: string;
  type: number;
  billingPeriod: number;
  price: number;
  currency: string;
  trialDays: number;
  active: boolean;
}): Promise<SubscriptionPrice | null> {
  return await db.subscriptionPrice.create({ data }).catch(() => {
    return null;
  });
}

export async function createSubscriptionFeature(data: {
  subscriptionProductId: string;
  order: number;
  key: string;
  value: string;
  included: boolean;
}): Promise<SubscriptionFeature | null> {
  return await db.subscriptionFeature.create({ data }).catch(() => {
    return null;
  });
}

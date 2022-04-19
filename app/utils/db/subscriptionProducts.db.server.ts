import { SubscriptionFeature, SubscriptionPrice, SubscriptionProduct } from ".prisma/client";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import { db } from "~/utils/db.server";

export type SubscriptionPriceWithProduct = SubscriptionPrice & {
  subscriptionProduct: SubscriptionProduct;
};

export async function getAllSubscriptionProductsWithTenants(): Promise<SubscriptionProductDto[]> {
  return await db.subscriptionProduct
    .findMany({
      include: {
        prices: {
          include: {
            tenantSubscriptions: {
              include: {
                tenant: true,
              },
            },
          },
        },
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

export async function getAllSubscriptionProducts(isPublic?: boolean): Promise<SubscriptionProductDto[]> {
  if (isPublic) {
    return await db.subscriptionProduct
      .findMany({
        where: {
          active: true,
          public: true,
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

export async function getSubscriptionProduct(id: string): Promise<SubscriptionProductDto | null> {
  return await db.subscriptionProduct.findUnique({
    where: {
      id,
    },
    include: {
      prices: true,
      features: true,
    },
  });
}

export async function getSubscriptionPrices(): Promise<SubscriptionPriceWithProduct[]> {
  return await db.subscriptionPrice
    .findMany({
      include: {
        subscriptionProduct: true,
      },
      orderBy: [
        {
          subscriptionProduct: {
            tier: "asc",
          },
        },
        {
          price: "asc",
        },
      ],
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
  public: boolean;
  maxUsers: number;
  monthlyContracts: number;
}): Promise<SubscriptionProduct> {
  return await db.subscriptionProduct.create({
    data,
  });
}

export async function updateSubscriptionProduct(
  id: string,
  data: {
    stripeId?: string;
    tier: number;
    title: string;
    description: string;
    badge: string;
    public: boolean;
    maxUsers: number;
    monthlyContracts: number;
  }
): Promise<SubscriptionProduct> {
  return await db.subscriptionProduct.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateSubscriptionProductStripeId(id: string, data: { stripeId: string }) {
  return await db.subscriptionProduct.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateSubscriptionPriceStripeId(id: string, data: { stripeId: string }) {
  return await db.subscriptionPrice.update({
    where: {
      id,
    },
    data,
  });
}

export async function createSubscriptionPrice(data: {
  subscriptionProductId: string;
  stripeId: string;
  type: SubscriptionPriceType;
  billingPeriod: SubscriptionBillingPeriod;
  price: number;
  currency: string;
  trialDays: number;
  active: boolean;
}): Promise<SubscriptionPrice> {
  return await db.subscriptionPrice.create({ data });
}

export async function createSubscriptionFeature(data: {
  subscriptionProductId: string;
  order: number;
  key: string;
  value: string;
  included: boolean;
}): Promise<SubscriptionFeature> {
  return await db.subscriptionFeature.create({ data });
}

export async function updateSubscriptionFeature(
  id: string,
  data: {
    order: number;
    key: string;
    value: string;
    included: boolean;
  }
): Promise<SubscriptionFeature> {
  return await db.subscriptionFeature.update({
    where: { id },
    data,
  });
}

export async function deleteSubscriptionProduct(id: string) {
  return await db.subscriptionProduct.delete({
    where: {
      id,
    },
  });
}

export async function deleteSubscriptionPrice(id: string) {
  return await db.subscriptionPrice.delete({
    where: {
      id,
    },
  });
}

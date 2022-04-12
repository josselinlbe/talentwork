import { TenantSubscription, SubscriptionPrice, SubscriptionProduct } from "@prisma/client";
import { db } from "../db.server";

export type TenantSubscriptionWithDetails = TenantSubscription & {
  subscriptionPrice:
    | (SubscriptionPrice & {
        subscriptionProduct: SubscriptionProduct;
      })
    | null;
};

export async function getOrPersistTenantSubscription(tenantId: string) {
  const subscription = await db.tenantSubscription.findUnique({
    where: {
      tenantId,
    },
  });

  if (!subscription) {
    return await createTenantSubscription(tenantId, "");
  }
  return subscription;
}

export async function getTenantSubscription(tenantId: string): Promise<TenantSubscriptionWithDetails | null> {
  return await db.tenantSubscription.findUnique({
    where: {
      tenantId,
    },
    include: {
      subscriptionPrice: {
        include: {
          subscriptionProduct: true,
        },
      },
    },
  });
}

export async function createTenantSubscription(tenantId: string, stripeCustomerId: string) {
  return await db.tenantSubscription.create({
    data: {
      tenantId,
      stripeCustomerId,
      maxWorkspaces: 0,
      maxUsers: 0,
      maxLinks: 0,
      maxStorage: 0,
      monthlyContracts: 0,
    },
  });
}

export async function updateTenantSubscriptionCustomerId(tenantId: string, data: { stripeCustomerId: string }) {
  return await db.tenantSubscription.update({
    where: {
      tenantId,
    },
    data,
  });
}

export async function updateTenantStripeSubscriptionId(
  tenantId: string,
  data: {
    subscriptionPriceId: string;
    stripeSubscriptionId: string;
  }
) {
  return await db.tenantSubscription.update({
    where: {
      tenantId,
    },
    data,
  });
}

export async function updateTenantSubscriptionLimits(
  tenantId: string,
  data: {
    maxWorkspaces: number;
    maxUsers: number;
    maxLinks: number;
    maxStorage: number;
    monthlyContracts: number;
  }
) {
  return await db.tenantSubscription.update({
    where: {
      tenantId,
    },
    data,
  });
}

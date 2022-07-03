import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import { db } from "../db.server";
import { getEntityByName } from "../db/entities/entities.db.server";
import { getAllSubscriptionFeatures } from "../db/subscriptionProducts.db.server";
import { getTenantSubscription } from "../db/tenantSubscriptions.db.server";

export async function getPlanFeaturesUsage(tenantId: string): Promise<PlanFeatureUsageDto[]> {
  const subscription = await getTenantSubscription(tenantId);

  const myUsage: PlanFeatureUsageDto[] = [];
  let allFeatures: SubscriptionFeatureDto[] = [];
  const features = await getAllSubscriptionFeatures();
  features.forEach((feature) => {
    const existing = allFeatures.find((f) => f.name === feature.name);
    if (!existing) {
      allFeatures.push({
        order: feature.order,
        name: feature.name,
        title: feature.title,
        type: feature.type,
        value: feature.value,
      });
    }
  });
  allFeatures = allFeatures.sort((a, b) => a.order - b.order);

  await Promise.all(
    allFeatures.map(async (item) => {
      const existingSubscriptionFeature = subscription?.subscriptionPrice?.subscriptionProduct.features.find((f) => f.name === item.name);
      const feature = existingSubscriptionFeature ?? item;
      const usage: PlanFeatureUsageDto = {
        order: feature.order,
        title: feature.title,
        name: feature.name,
        type: feature.type,
        value: feature.value,
        used: 0,
        remaining: 0,
        enabled: feature.type !== SubscriptionFeatureLimitType.NOT_INCLUDED,
        message: "",
      };

      if (!existingSubscriptionFeature) {
        usage.type = SubscriptionFeatureLimitType.NOT_INCLUDED;
        usage.enabled = false;
        usage.message = "You don't have an active subscription";
      } else {
        if (feature.type === SubscriptionFeatureLimitType.NOT_INCLUDED) {
          usage.enabled = false;
          usage.message = "Not included in current plan";
        } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
          usage.used = await getUsed(tenantId, feature);
          usage.remaining = usage.value - usage.used;
          if (usage.remaining <= 0) {
            usage.message = `You've reached the limit (${usage.value}) for ${feature.name}`;
            usage.enabled = false;
          }
        } else if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
          usage.used = await getUsed(tenantId, feature);
          usage.remaining = usage.value - usage.used;
          if (usage.remaining <= 0) {
            // var now = new Date();
            // const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

            usage.message = `You've reached the limit this month (${usage.value}) for ${feature.name}`;
            usage.enabled = false;
          }
        } else if (feature.type === SubscriptionFeatureLimitType.UNLIMITED) {
          usage.remaining = 10000000;
        }
      }
      myUsage.push(usage);
    })
  );

  return myUsage.sort((a, b) => a.order - b.order);
}

export async function getPlanFeatureUsage(tenantId: string, featureName: string): Promise<PlanFeatureUsageDto | undefined> {
  const usage = await getPlanFeaturesUsage(tenantId);
  return usage.find((f) => f.name === featureName);
}

async function getUsed(tenantId: string, feature: SubscriptionFeatureDto): Promise<number> {
  const date = new Date(),
    y = date.getFullYear(),
    m = date.getMonth();
  const firstDay = new Date(y, m, 1, 0, 0, 1);
  var lastDay = new Date(y, m + 1, 0, 23, 59, 59);

  if (feature.name === DefaultFeatures.Users) {
    if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
      return db.tenantUser.count({
        where: {
          tenantId,
          createdAt: {
            gte: firstDay,
            lt: lastDay,
          },
        },
      });
    } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
      return db.tenantUser.count({
        where: {
          tenantId,
        },
      });
    }
  } else if (feature.name === DefaultFeatures.API) {
    if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
      return db.apiKeyLog.count({
        where: {
          apiKey: {
            tenantId,
          },
          status: { in: [200, 201] },
          createdAt: {
            gte: firstDay,
            lt: lastDay,
          },
        },
      });
    } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
      return db.apiKeyLog.count({
        where: {
          apiKey: {
            tenantId,
          },
          status: { in: [200, 201] },
        },
      });
    }
  } else {
    const entity = await getEntityByName(feature.name);
    if (!entity) {
      throw new Error("Entity does not exist with plural title: " + feature.name);
    }
    if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
      return db.row.count({
        where: {
          parentRowId: null,
          tenantId,
          entityId: entity?.id ?? "",
          createdAt: {
            gte: firstDay,
            lt: lastDay,
          },
        },
      });
    } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
      return db.row.count({
        where: {
          parentRowId: null,
          tenantId,
          entityId: entity?.id ?? "",
        },
      });
    }
  }
  return 0;
}

// export async function getPlanFeatureUsage(tenantId: string, featureName: string): Promise<PlanFeatureUsageDto> {
//   const myUsage: PlanFeatureUsageDto[] = [];
//   let allFeatures: SubscriptionFeatureDto[] = [];
//   const features = await getAllSubscriptionFeatures();
//   features.forEach((feature) => {
//     const existing = allFeatures.find((f) => f.name === feature.name);
//     if (!existing) {
//       allFeatures.push({
//         order: feature.order,
//         name: feature.name,
//         title: feature.title,
//         type: feature.type,
//         value: feature.value,
//       });
//     }
//   });
//   allFeatures = allFeatures.sort((a, b) => a.order - b.order);

//   allFeatures.forEach((feature) => {
//     const featureUsage: PlanFeatureUsageDto = {
//       order: feature.order,
//       title: feature.title,
//       name: feature.name,
//       type: feature.type,
//       value: feature.value,
//       used: 0,
//       remaining: 0,
//     };
//     if (feature.type === SubscriptionFeatureLimitType.MAX) {
//       featureUsage.used = 2;
//       featureUsage.remaining = featureUsage.value - featureUsage.used;
//     } else if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
//       featureUsage.used = 3;
//       featureUsage.remaining = featureUsage.value - featureUsage.used;
//     }
//     myUsage.push(featureUsage);
//   });

//   return myUsage;
// }

import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionPriceType } from "~/application/enums/subscriptions/SubscriptionPriceType";
import { SubscriptionProductDto } from "../dtos/subscriptions/SubscriptionProductDto";

const currency = "usd";
const plans: SubscriptionProductDto[] = [
  {
    stripeId: "",
    tier: 1,
    title: "pricing.products.plan1.title",
    description: "pricing.products.plan1.description",
    contactUs: false,
    prices: [
      {
        stripeId: "",
        subscriptionProductId: "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: SubscriptionBillingPeriod.MONTHLY,
        price: 0,
        currency,
        trialDays: 0,
        active: true,
      },
      {
        stripeId: "",
        subscriptionProductId: "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: SubscriptionBillingPeriod.YEARLY,
        price: 0,
        currency,
        trialDays: 0,
        active: true,
      },
    ],
    features: [
      {
        subscriptionProductId: "",
        order: 1,
        key: "pricing.features.maxUsers",
        value: "2",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 2,
        key: "pricing.features.oneTenantRelationship",
        value: "1",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 3,
        key: "pricing.features.oneContract",
        value: "1",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 4,
        key: "pricing.features.maxStorage",
        value: "1 GB",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 5,
        key: "pricing.features.prioritySupport",
        value: "",
        included: false,
      },
    ],
    badge: "",
    active: true,
    maxUsers: 2,
    maxTenantRelationships: 1,
    maxStorage: 1024,
    monthlyContracts: 1,
  },
  {
    stripeId: "",
    tier: 2,
    title: "pricing.products.plan2.title",
    description: "pricing.products.plan2.description",
    contactUs: false,
    prices: [
      {
        stripeId: "",
        subscriptionProductId: "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: SubscriptionBillingPeriod.MONTHLY,
        price: 199,
        currency,
        trialDays: 30,
        active: true,
      },
      {
        stripeId: "",
        subscriptionProductId: "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: SubscriptionBillingPeriod.YEARLY,
        price: 1999,
        currency,
        trialDays: 0,
        active: true,
      },
    ],
    features: [
      {
        subscriptionProductId: "",
        order: 1,
        key: "pricing.features.maxUsers",
        value: "5",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 2,
        key: "pricing.features.maxTenantRelationships",
        value: "45",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 3,
        key: "pricing.features.maxContracts",
        value: "45",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 4,
        key: "pricing.features.maxStorage",
        value: "100 GB",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 5,
        key: "pricing.features.prioritySupport",
        value: "",
        included: false,
      },
    ],
    badge: "pricing.recommended",
    active: true,
    maxUsers: 5,
    maxTenantRelationships: 45,
    maxStorage: 100 * 1024,
    monthlyContracts: 45,
  },
  {
    stripeId: "",
    tier: 3,
    title: "pricing.products.plan3.title",
    description: "pricing.products.plan3.description",
    contactUs: false,
    prices: [
      {
        stripeId: "",
        subscriptionProductId: "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: SubscriptionBillingPeriod.MONTHLY,
        price: 399,
        currency,
        trialDays: 30,
        active: true,
      },
      {
        stripeId: "",
        subscriptionProductId: "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: SubscriptionBillingPeriod.YEARLY,
        price: 3999,
        currency,
        trialDays: 0,
        active: true,
      },
    ],
    features: [
      {
        subscriptionProductId: "",
        order: 1,
        key: "pricing.features.maxUsers",
        value: "12",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 2,
        key: "pricing.features.maxTenantRelationships",
        value: "100",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 3,
        key: "pricing.features.maxContracts",
        value: "90",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 4,
        key: "pricing.features.maxStorage",
        value: "500 GB",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 5,
        key: "pricing.features.prioritySupport",
        value: "",
        included: true,
      },
    ],
    badge: "",
    active: true,
    maxUsers: 12,
    maxTenantRelationships: 100,
    maxStorage: 500 * 1024,
    monthlyContracts: 90,
  },
  {
    stripeId: "",
    tier: 4,
    title: "pricing.products.plan4.title",
    description: "pricing.products.plan4.description",
    contactUs: true,
    prices: [
      {
        stripeId: "",
        subscriptionProductId: "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: SubscriptionBillingPeriod.MONTHLY,
        price: 0,
        currency,
        trialDays: 0,
        active: true,
      },
      {
        stripeId: "",
        subscriptionProductId: "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: SubscriptionBillingPeriod.YEARLY,
        price: 0,
        currency,
        trialDays: 0,
        active: true,
      },
    ],
    features: [
      {
        subscriptionProductId: "",
        order: 1,
        key: "pricing.features.maxUsers",
        value: "12+",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 2,
        key: "pricing.features.maxTenantRelationships",
        value: "100+",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 3,
        key: "pricing.features.maxContracts",
        value: "90+",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 4,
        key: "pricing.features.maxStorage",
        value: "500+ GB",
        included: true,
      },
      {
        subscriptionProductId: "",
        order: 5,
        key: "pricing.features.prioritySupport",
        value: "",
        included: false,
      },
    ],
    badge: "",
    active: true,
    maxUsers: 12,
    maxTenantRelationships: 100,
    maxStorage: 0,
    monthlyContracts: 90,
  },
];

export default plans;

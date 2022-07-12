import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

export type SubscriptionSubscribedDto = {
  user: {
    id: string;
    email: string;
  };
  subscription: {
    price: {
      id: string;
      billingPeriod: SubscriptionBillingPeriod;
      amount: number;
    };
    product: {
      id: string;
      title: string;
    };
  };
};

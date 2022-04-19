import { SubscriptionPriceDto } from "./SubscriptionPriceDto";
import { SubscriptionFeatureDto } from "./SubscriptionFeatureDto";

export interface SubscriptionProductDto {
  id?: string;
  stripeId: string;
  tier: number;
  title: string;
  description: string;
  badge: string;
  active: boolean;
  public: boolean;
  maxUsers: number;
  monthlyContracts: number;
  prices: SubscriptionPriceDto[];
  features: SubscriptionFeatureDto[];
  translatedTitle?: string;
}

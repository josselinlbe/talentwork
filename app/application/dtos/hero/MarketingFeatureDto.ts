export enum MarketingFeatureStatus {
  UnderReview,
  Planned,
  InProgress,
  Done,
}
export enum MarketingFeatureType {
  Core,
  Enterprise,
}
export interface MarketingFeatureDto {
  status: MarketingFeatureStatus;
  name: string;
  type: MarketingFeatureType;
  description: string;
  link?: string;
  save?: number;
  platforms?: {
    site?: string;
    price?: string;
  }[];
}

import { TFunction } from "react-i18next";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionPriceWithProduct } from "../db/subscriptionProducts.db.server";
import NumberUtils from "../shared/NumberUtils";

function getPriceDescription(t: TFunction, item: SubscriptionPriceWithProduct) {
  return `${t(item.subscriptionProduct.title)} - $${NumberUtils.decimalFormat(item.price)} - ${getBillingPeriodDescription(t, item.billingPeriod)}`;
}

function getBillingPeriodDescription(t: TFunction, billingPeriod: SubscriptionBillingPeriod) {
  return t("pricing." + SubscriptionBillingPeriod[billingPeriod].toString()).toString();
}

export default {
  getPriceDescription,
  getBillingPeriodDescription,
};

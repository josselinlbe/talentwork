import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import { MarketingFeatureType } from "~/application/dtos/marketing/MarketingFeatureDto";
import { getFeatures, getUpcomingFeatures } from "~/utils/services/marketingService";
import ToggleBillingPeriod from "../core/settings/subscription/ToggleBillingPeriod";
import CheckIcon from "../ui/icons/CheckIcon";

const baseFeatures = ["Monthly updates", "Private repository access"];
const plans = [
  {
    title: "🪨 MVP-Builder",
    description: (
      <div>
        By subscribing now, <b className="font-bold">you can lock in this pre-release pricing forever</b> for Core Features 🪨.
      </div>
    ),
    monthlyPrice: "99",
    monthlyPriceBefore: "199",
    yearlyPrice: "990",
    yearlyPriceBefore: "2,388",
    features: [
      ...baseFeatures,
      ...getFeatures().map((i) => i.name),
      ...getUpcomingFeatures()
        .filter((f) => f.type === MarketingFeatureType.Core)
        .map((i) => i.name + " (under 🚧)"),
    ],
    enabled: true,
    productUrl: "https://alexandromg.gumroad.com/l/SaasRock?tier=Core%20Features%20%F0%9F%AA%A8&wanted=true",
  },
  {
    title: (
      <div>
        🚀 Enterprise-Builder <span className=" text-red-500 italic text-lg">(IN CONSTRUCTION)</span>
      </div>
    ),
    description: (
      <div>
        By subscribing now, <b className="font-bold">you can lock in this pre-release pricing forever</b> for Enterprise Features 🚀.{" "}
        <b className="text-red-500 font-bold">Please note that Enterprise Features are still in construction</b>.
      </div>
    ),
    monthlyPrice: "149",
    monthlyPriceBefore: "499",
    yearlyPrice: "1,490",
    yearlyPriceBefore: "5,988",
    features: [
      "All core features",
      ...baseFeatures,
      ...getUpcomingFeatures()
        .filter((f) => f.type === MarketingFeatureType.Enterprise)
        .map((i) => i.name + " (under 🚧)"),
    ],
    enabled: true,
    productUrl: "https://alexandromg.gumroad.com/l/SaasRock?tier=Enterprise%20Features%20%F0%9F%9A%80&wanted=true",
  },
];

export default function PricingCTA() {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState(SubscriptionBillingPeriod.MONTHLY);
  function toggleBillingPeriod() {
    if (billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
      setBillingPeriod(SubscriptionBillingPeriod.YEARLY);
    } else {
      setBillingPeriod(SubscriptionBillingPeriod.MONTHLY);
    }
  }
  function getPrice(plan: any) {
    if (billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
      return plan.monthlyPrice;
    } else {
      return plan.yearlyPrice;
    }
  }
  function getPreviousPrice(plan: any) {
    if (billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
      return plan.monthlyPriceBefore;
    } else {
      return plan.yearlyPriceBefore;
    }
  }
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="pt-12 sm:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-4xl">Pre-release Pricing</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Get a license to run your SaaS in production + Software updates, bug fixes, support, and private access{" "}
              <i>(as long as your subscription is active)</i>.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-8">
        {plans.map((plan, idx) => {
          return (
            <div key={idx} className="bg-white dark:bg-gray-900">
              <div className="relative">
                <div className="absolute inset-0 h-1/2 bg-white dark:bg-gray-900" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div
                    className={clsx(
                      "max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-none lg:flex border-4 border-gray-300 dark:border-gray-700 border-dotted",
                      !plan.enabled && "bg-gray-100 opacity-50"
                    )}
                  >
                    <div className="flex-1 bg-white dark:bg-gray-900 px-6 py-8 lg:p-12">
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">{plan.title}</h3>
                      <p className="mt-6 text-base text-gray-600 dark:text-gray-400 mb-3">{plan.description}</p>
                      <div className="mt-8">
                        <div className="flex items-center">
                          <h4 className="flex-shrink-0 pr-4 bg-white dark:bg-gray-900 text-sm tracking-wider font-semibold uppercase text-theme-600">
                            {t("pricing.whatsIncluded")}
                          </h4>
                          <div className="flex-1 border-t-2 border-gray-200 dark:border-gray-700" />
                        </div>
                        <ul className="mt-8 space-y-5 lg:space-y-0 lg:grid sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-3 lg:grid-cols-3 lg:gap-x-2 lg:gap-y-5">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start lg:col-span-1">
                              <div className="flex-shrink-0">
                                <CheckIcon className="h-5 w-5 text-theme-400" aria-hidden="true" />
                              </div>
                              <p className="ml-1 text-sm text-gray-700 dark:text-gray-400 truncate">{feature}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="py-8 px-6 text-center bg-gray-50 dark:bg-gray-900 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
                      <ToggleBillingPeriod
                        disabled={!plan.enabled}
                        className="mb-2 text-sm"
                        size="sm"
                        billingPeriod={billingPeriod}
                        toggleBillingPeriod={toggleBillingPeriod}
                        yearlyDiscount={"2 months free"}
                      />
                      {/* <p className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Subscribe</p> */}

                      {/* <ToggleBillingPeriod size="sm" billingPeriod={billingPeriod} toggleBillingPeriod={toggleBillingPeriod} yearlyDiscount={"-16%"} /> */}
                      <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900 dark:text-white">
                        <span className="text-2xl line-through text-gray-700 dark:text-gray-400 font-medium">${getPreviousPrice(plan)}</span>
                        <span>${getPrice(plan)}</span>
                        <span className="ml-1 text-xl font-medium text-gray-700">USD</span>
                      </div>

                      <div className="mt-6">
                        <div className="rounded-md shadow">
                          <button
                            type="button"
                            disabled={!plan.enabled}
                            onClick={() => (location.href = plan.productUrl)}
                            className={clsx(
                              "flex items-center justify-center space-x-2 px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-theme-500 w-full",
                              plan.enabled ? "hover:bg-theme-600" : " opacity-75 cursor-not-allowed"
                            )}
                          >
                            <div>{plan.enabled ? `Get early access` : `In construction`}</div>
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <span className="font-medium text-gray-900">Up to 5 developers - Cancel anytime</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

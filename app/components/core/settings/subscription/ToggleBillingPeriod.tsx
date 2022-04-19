import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

interface Props {
  billingPeriod: SubscriptionBillingPeriod;
  toggleBillingPeriod: () => void;
  yearlyDiscount: string | undefined;
}

export default function ToggleBillingPeriod({ billingPeriod, toggleBillingPeriod, yearlyDiscount }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center mt-10 space-x-4">
      <span className="text-base font-medium">{t("pricing.MONTHLY")}</span>
      <button
        type="button"
        className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
        onClick={toggleBillingPeriod}
      >
        <div className="w-16 h-8 transition bg-theme-500 rounded-full shadow-md outline-none"></div>
        <div
          className={clsx(
            "absolute inline-flex bg-white items-center justify-center w-6 h-6 transition-all duration-200 ease-in-out transform rounded-full shadow-sm top-1 left-1",
            billingPeriod === 3 && "translate-x-0",
            billingPeriod === 4 && "translate-x-8"
          )}
        ></div>
      </button>
      <span className="text-base font-medium">
        {t("pricing.YEARLY")}{" "}
        {yearlyDiscount && (
          <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-teal-100 text-teal-800">{yearlyDiscount}</span>
        )}
      </span>
    </div>
  );
}

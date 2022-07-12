import { MarketingFeatureDto, MarketingFeatureStatus, MarketingFeatureType } from "~/application/dtos/marketing/MarketingFeatureDto";
import { Colors } from "~/application/enums/shared/Colors";
import { getUpcomingFeatures } from "~/utils/services/marketingService";
import NumberUtils from "~/utils/shared/NumberUtils";
import SimpleBadge from "../ui/badges/SimpleBadge";

const features = [...getUpcomingFeatures()];

export default function UpcomingFeatures() {
  function getMarketingFeatureStatusDescription(item: MarketingFeatureDto) {
    if (item.status === MarketingFeatureStatus.Planned) {
      return `Planned`;
    } else if (item.status === MarketingFeatureStatus.UnderReview) {
      return `Under Review`;
    } else if (item.status === MarketingFeatureStatus.InProgress) {
      return `In Progress`;
    } else if (item.status === MarketingFeatureStatus.Done) {
      return `Done`;
    }
    return "?";
  }
  function getMarketingFeatureStatusColor(item: any) {
    if (item.status === MarketingFeatureStatus.Planned) {
      return Colors.BLUE;
    } else if (item.status === MarketingFeatureStatus.UnderReview) {
      return Colors.YELLOW;
    } else if (item.status === MarketingFeatureStatus.InProgress) {
      return Colors.GREEN;
    } else if (item.status === MarketingFeatureStatus.Done) {
      return Colors.GREEN;
    }
    return Colors.UNDEFINED;
  }
  return (
    <div className="pt-12 relative">
      <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-base font-semibold uppercase tracking-wider text-theme-600">Enterprise-Ready</h2>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Enterprise Features 🚀</p>
        <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">
          We're hoping to meet{" "}
          <a href="https://www.enterpriseready.io/" className="border-b border-theme-300 border-dashed hover:border-dotted">
            EnterpriseReady.io’s
          </a>{" "}
          recommendations for Enterprise SaaS providers without doing anything. SaasRock will check all the boxes.
        </p>
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {features.map((item) => (
              <div key={item.name} className="">
                <div className="flow-root rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-dotted border-gray-500 dark:border-gray-600 px-2 pb-8">
                  <div className="pt-3 space-y-2">
                    {/* <div>
                      {item.iconUrl ? (
                        <img alt={item.name} src={item.iconUrl} className="inline-flex items-center justify-center rounded-md bg-white p-3 shadow-lg" />
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-md bg-theme-500 p-3 shadow-lg">
                          <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      )}
                    </div> */}
                    <div className="flex items-center space-x-1 justify-center">
                      <SimpleBadge color={getMarketingFeatureStatusColor(item)} title={getMarketingFeatureStatusDescription(item)} />
                      {/* <div className="text-xs">{item.type === MarketingFeatureType.Core ? "🪨" : "🚀"}</div> */}
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white border-gray-300 dark:border-gray-700">{item.name}</h3>
                    {/* <p className="mt-5 text-base text-gray-500">{item.description}</p> */}
                    <div>
                      {item.platforms && item.platforms?.length > 0 && item.save && (
                        <a
                          href={item.platforms[0].site}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-gray-500 dark:text-gray-400 border-b border-theme-300 border-dashed hover:border-dotted font-medium"
                        >
                          Save +${NumberUtils.numberFormat(item.save * 12)} per year!
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

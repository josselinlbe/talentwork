import { ReactNode } from "react";
import { useParams } from "@remix-run/react";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import UrlUtils from "~/utils/app/UrlUtils";

interface Props {
  item: PlanFeatureUsageDto | undefined;
  children: ReactNode;
  hideContent?: boolean;
}
export default function CheckPlanFeatureLimit({ item, children, hideContent = true }: Props) {
  const params = useParams();
  return (
    <div>
      {item && !item.enabled ? (
        <div className="space-y-2">
          <WarningBanner redirect={UrlUtils.currentTenantUrl(params, `settings/subscription`)} title={item.title} text={``}>
            <div className="mt-2">
              <span>{item.message}</span>
            </div>
          </WarningBanner>

          {!hideContent && children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

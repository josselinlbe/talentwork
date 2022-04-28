import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useAppData } from "~/utils/data/useAppData";
import { useLoaderData, useParams } from "remix";
import { DashboardLoaderData } from "~/utils/data/useDashboardData";
import clsx from "clsx";
import UrlUtils from "~/utils/app/UrlUtils";

interface Props {
  className?: string;
  withCurrentPlan: boolean;
  cols?: string;
}

export default function MySubscriptionProducts({ className = "", withCurrentPlan = false, cols = "grid-cols-2 sm:grid-cols-2 xl:grid-cols-2" }: Props) {
  const params = useParams();
  const { t } = useTranslation();
  const data = useLoaderData<DashboardLoaderData>();
  const appData = useAppData();

  function billableStatus(max: number): number {
    if (!appData.mySubscription) {
      return 0;
    }
    if (max === 0) {
      return 1;
    }
    if (max > 0) {
      return 2;
    }
    return 0;
  }

  const maxUsers = appData.mySubscription?.subscriptionPrice?.subscriptionProduct.maxUsers ?? 0;
  const monthlyContracts = appData.mySubscription?.subscriptionPrice?.subscriptionProduct.monthlyContracts ?? 0;

  const maxDocumentsRemaining = (monthlyContracts ?? 0) - data.contracts;
  const maxUsersRemaining = maxUsers - data.users;

  return (
    <div className={className}>
      <div>
        <dl className={clsx("grid gap-5", cols, withCurrentPlan && "mt-2 ")}>
          <Link
            to={UrlUtils.currentTenantUrl(params, "settings/members")}
            className={clsx(
              "bg-white px-4 py-5 border border-gray-300 shadow-md rounded-lg overflow-hidden sm:p-6 hover:bg-gray-50",
              billableStatus(maxUsersRemaining) === 0 && "bg-gray-50 border-gray-300 hover:bg-gray-100 cursor-pointer",
              billableStatus(maxUsersRemaining) === 1 && "bg-gray-50 border-yellow-300 hover:bg-yellow-100 cursor-pointer",
              billableStatus(maxUsersRemaining) === 2 && "bg-white",
              billableStatus(maxUsersRemaining) === 3 && "bg-teal-50 border-teal-300 hover:bg-teal-100 cursor-pointer"
            )}
          >
            <dt className="text-sm font-medium text-gray-500 truncate">{t("models.user.plural")}</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              <span>
                {data ? <span>{data.users}</span> : <span>0</span>} /{" "}
                {appData.mySubscription ? <span>{maxUsers ?? 0}</span> : <span className="text-gray-500">0</span>}
              </span>
            </dd>
          </Link>

          <Link
            to={`${UrlUtils.currentTenantUrl(params, "contracts?status=pending")}`}
            className={clsx(
              "bg-white px-4 py-5 border border-gray-300 shadow-md rounded-lg overflow-hidden sm:p-6 hover:bg-gray-50",
              billableStatus(maxDocumentsRemaining) === 0 && "bg-gray-50 border-gray-300 hover:bg-gray-100 cursor-pointer",
              billableStatus(maxDocumentsRemaining) === 1 && "bg-gray-50 border-gray-300 hover:bg-gray-100 cursor-pointer",
              billableStatus(maxDocumentsRemaining) === 2 && "bg-white",
              billableStatus(maxDocumentsRemaining) === 3 && "bg-teal-50 border-teal-300 hover:bg-teal-100 cursor-pointer"
            )}
          >
            <dt className="text-sm font-medium text-gray-500 truncate">{t("models.contract.plural")}</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              <span>
                {data && data.contracts ? <span>{data.contracts}</span> : <span>0</span>} /{" "}
                {appData.mySubscription ? <span>{monthlyContracts ?? 0}</span> : <span className="text-gray-500">0</span>}
              </span>
            </dd>
          </Link>
        </dl>
      </div>
    </div>
  );
}

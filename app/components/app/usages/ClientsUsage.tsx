import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDashboardData } from "~/utils/data/useDashboardData";
import { useParams } from "remix";
import UrlUtils from "~/utils/app/UrlUtils";

export default function ClientsUsage() {
  const params = useParams();
  const dashboardData = useDashboardData();
  const { t } = useTranslation();

  return (
    <Link
      to={UrlUtils.currentTenantUrl(params, "settings/tenant-relationships")}
      className="px-4 py-5 border shadow-md rounded-lg overflow-hidden sm:p-6 bg-white border-gray-300 hover:bg-gray-50"
    >
      <div>
        <dt className="text-sm font-medium text-gray-500 truncate">{t("models.client.plural")}</dt>
        <dd className="mt-1 text-gray-900 truncate">
          <span className="text-xl font-semibold">{dashboardData.clients}</span>
        </dd>
      </div>
    </Link>
  );
}

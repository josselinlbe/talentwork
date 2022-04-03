import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDashboardData } from "~/utils/data/useDashboardData";

export default function EmployeesUsage() {
  const dashboardData = useDashboardData();
  const { t } = useTranslation();

  return (
    <Link to="/app/employees" className="px-4 py-5 border shadow-md rounded-lg overflow-hidden sm:p-6 bg-white border-gray-300 hover:bg-gray-50">
      <div>
        <dt className="text-sm font-medium text-gray-500 truncate">{t("models.employee.plural")}</dt>
        <dd className="mt-1 text-gray-900 truncate">
          <span className="text-xl font-semibold">{dashboardData.employees}</span>
        </dd>
      </div>
    </Link>
  );
}

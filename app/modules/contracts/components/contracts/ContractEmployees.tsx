import { useTranslation } from "react-i18next";
import clsx from "~/utils/shared/ClassesUtils";
import { EmployeeDto } from "../../dtos/EmployeeDto";

interface Props {
  items: EmployeeDto[];
}

export default function ContractEmployees({ items }: Props) {
  const { t } = useTranslation();

  const sortedItems = () => {
    return items?.slice().sort((x, y) => {
      return x.firstName > y.firstName ? 1 : -1;
    });
  };

  return (
    <div>
      <h3 className="mb-2 text-gray-400 font-medium text-sm">{t("models.employee.plural")}</h3>
      <div className="bg-white border-gray-200 rounded-md border shadow-md overflow-hidden">
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {sortedItems().map((employee, idx) => {
              return (
                <li key={idx} className={clsx("flex items-center justify-between py-2 px-4 space-x-2")}>
                  <div className="truncate">
                    <div className="text-sm font-medium text-gray-800 truncate flex items-center space-x-1 justify-between">
                      <div className="text-sm font-medium text-gray-800 truncate flex items-center space-x-1 justify-between">
                        {employee.firstName} {employee.lastName}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 justify-between truncate">
                      <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

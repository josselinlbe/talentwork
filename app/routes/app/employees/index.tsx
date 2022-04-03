import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { Employee } from "@prisma/client";
import { getUserInfo } from "~/utils/session.server";
import { getEmployees } from "~/modules/contracts/db/employees.db.server";
import EmployeesList from "~/modules/contracts/components/employees/EmployeesList";
import { i18n } from "~/locale/i18n.server";

type LoaderData = {
  title: string;
  items: Employee[];
};
export let loader: LoaderFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");

  const userInfo = await getUserInfo(request);
  const items = await getEmployees(userInfo.currentWorkspaceId);
  const data: LoaderData = {
    title: `${t("models.employee.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function EmployeesRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("app.employees.my")}</h1>
          <div className="flex items-center space-x-2">
            <ButtonPrimary to="/app/employees/new">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>

              <div>{t("app.employees.new.title")}</div>
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <EmployeesList items={data.items} />
      </div>
    </div>
  );
}

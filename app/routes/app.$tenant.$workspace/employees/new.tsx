import { useTranslation } from "react-i18next";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useParams } from "remix";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef } from "react";
import { getUserInfo } from "~/utils/session.server";
import AddEmployees from "~/modules/contracts/components/employees/AddEmployees";
import { i18nHelper } from "~/locale/i18n.utils";
import { createEmployees } from "~/modules/contracts/services/employeesService";
import { getEmployeeByEmail } from "~/modules/contracts/db/employees.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { createUserEvent } from "~/utils/db/users.db.server";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("app.employees.new.multiple")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const userInfo = await getUserInfo(request);
  const tenantUrl = await getTenantUrl(params);

  const form = await request.formData();
  const employeesArr = form.getAll("employees[]");
  const employees: { email: string; firstName: string; lastName: string }[] = employeesArr.map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  if (employees.length === 0) {
    return badRequest({ error: "Add at least one employee" });
  }
  const findExistingEmployees = employees.map(async (employee) => {
    if (!employee.email) {
      return `Email required`;
    } else if (!employee.firstName) {
      return `First name required`;
    } else if (!employee.lastName) {
      return `Last name required`;
    }
    const existing = await getEmployeeByEmail(tenantUrl.workspaceId, employee.email);
    if (existing) {
      return `Employee with email ${existing.email} already added`;
    }
    return null;
  });

  const existingEmployeesErrors = (await Promise.all(findExistingEmployees)).filter((f) => f);
  if (existingEmployeesErrors.length > 0) {
    return badRequest({ error: existingEmployeesErrors.join(", ") });
  }

  try {
    await createEmployees(userInfo.userId, tenantUrl.tenantId, tenantUrl.workspaceId, employees);
    await createUserEvent(
      {
        tenantUrl,
        userId: userInfo.userId,
      },
      `Created employees`,
      employees.map((f) => `${f.firstName} ${f.lastName} (${f.email})`).join(" | ")
    );
    return redirect(`${UrlUtils.currentTenantUrl(params, "employees")}`);
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function NewEmployeesRoute() {
  const params = useParams();
  const { t } = useTranslation();
  const actionData = useActionData<ActionData>();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <div>
      <Breadcrumb
        menu={[
          {
            title: t("models.employee.plural"),
            routePath: `${UrlUtils.currentTenantUrl(params, "employees")}`,
          },
          {
            title: t("shared.new"),
          },
        ]}
      ></Breadcrumb>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h2 className="flex-1 font-bold flex items-center truncate">{t("app.employees.new.multiple")}</h2>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <AddEmployees />
      </div>
      <ErrorModal ref={errorModal} />
    </div>
  );
}

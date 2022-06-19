import { useTranslation } from "react-i18next";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import ContractDetails from "~/modules/contracts/components/contracts/ContractDetails";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useParams } from "remix";
import { ContractWithDetails, getContract, updateContract } from "~/modules/contracts/db/contracts.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserInfo } from "~/utils/session.server";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useRef, useEffect } from "react";
import { sendContract } from "~/modules/contracts/utils/ContractUtils";
import UrlUtils from "~/utils/app/UrlUtils";
import { deleteRow, getRow, getRowsInIds } from "~/utils/db/entities/rows.db.server";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getTenantUrl } from "~/utils/services/urlService";
import ApiHelper from "~/utils/helpers/ApiHelper";
import { EmployeeDto } from "~/modules/contracts/dtos/EmployeeDto";
import { createRowLog } from "~/utils/db/logs.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppData } from "~/utils/data/useAppData";

type LoaderData = {
  title: string;
  item: ContractWithDetails | null;
  employees: EmployeeDto[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.entity.contract.read", tenantUrl.tenantId);
  const item = await getContract(params.id);
  const employeeEntity = await getEntityBySlug("employees");
  if (!employeeEntity) {
    return badRequest({ error: "Employee entity required" });
  }
  const employeeRows = await getRowsInIds(tenantUrl.tenantId, item?.employees.map((f) => f.rowId) ?? []);
  const employees = employeeRows.map((employee) => ApiHelper.getApiFormat(employeeEntity, employee));
  const data: LoaderData = {
    title: `${item?.name} | ${process.env.APP_NAME}`,
    item,
    employees,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);
  const entity = await getEntityBySlug("contracts");
  if (!entity) {
    return badRequest({ error: "Contracts entity required" });
  }

  if (!params.id) {
    return badRequest({ error: t("shared.notFound") });
  }
  const form = await request.formData();

  const action = form.get("action")?.toString();
  const name = form.get("name")?.toString();
  const description = form.get("description")?.toString();
  const file = form.get("file")?.toString();
  const status = Number(form.get("status"));

  const existing = await getContract(params.id);
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }
  const existingRow = await getRow(entity.id, existing.rowId, tenantUrl.tenantId);

  if (action === "edit") {
    if (!name) {
      return badRequest({ error: "Name required" });
    } else if (!description) {
      return badRequest({ error: "Description required" });
    } else if (!file) {
      return badRequest({ error: "File required" });
    }
    await createRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: "Updated", entity, item: existingRow });
    await updateContract(params.id, userInfo.userId, {
      name,
      description,
      file,
      status,
    });

    return json({ success: t("shared.updated") });
  } else if (action === "delete") {
    await createRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: "Deleted", entity, item: existingRow });
    await deleteRow(existing.rowId);

    return redirect(UrlUtils.currentTenantUrl(params, "contracts?status=all"));
  } else if (action === "send") {
    const contract = await getContract(params.id);
    if (!contract) {
      return badRequest({ error: t("shared.notFound") });
    }

    const employeeEntity = await getEntityBySlug("employees");
    if (!employeeEntity) {
      return badRequest({ error: "Employee entity required" });
    }
    const employeeRows = await getRowsInIds(tenantUrl.tenantId, contract?.employees.map((f) => f.rowId) ?? []);
    const employees = employeeRows.map((employee) => ApiHelper.getApiFormat(employeeEntity, employee));

    await sendContract(request, params, contract, employees);

    return json({ success: "Contract sent" });
  }

  return badRequest({ error: t("shared.invalidForm") });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function ContractRoute() {
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const appData = useAppData();
  const { t } = useTranslation();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData?.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <div>
      <Breadcrumb
        menu={[
          {
            title: t("app.contracts.title"),
            routePath: UrlUtils.currentTenantUrl(params, "contracts?status=pending"),
          },
        ]}
      ></Breadcrumb>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8">
        {data.item ? (
          <ContractDetails
            item={data.item}
            employees={data.employees}
            canUpdate={appData.permissions.includes("app.entity.contract.update")}
            canDelete={appData.permissions.includes("app.entity.contract.delete")}
          />
        ) : (
          <div>{t("shared.notFound")}</div>
        )}
        <ErrorModal ref={errorModal} />
      </div>
    </div>
  );
}

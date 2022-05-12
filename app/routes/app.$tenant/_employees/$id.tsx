import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useParams } from "remix";
import { deleteEmployee, EmployeeWithCreatedByUser, getEmployee, updateEmployee } from "~/modules/contracts/db/employees.db.server";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { i18nHelper } from "~/locale/i18n.utils";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import EmployeeProfile from "~/modules/contracts/components/employees/EmployeeProfile";
import UrlUtils from "~/utils/app/UrlUtils";
import { createLog } from "~/utils/db/logs.db.server";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  title: string;
  item: EmployeeWithCreatedByUser | null;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const item = await getEmployee(params.id);
  const data: LoaderData = {
    title: `${item?.firstName} ${item?.lastName} | ${process.env.APP_NAME}`,
    item,
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

  if (!params.id) {
    return badRequest({ error: t("shared.notFound") });
  }
  const form = await request.formData();

  const action = form.get("action")?.toString();
  const email = form.get("email")?.toString().toLowerCase().trim();
  const firstName = form.get("first-name")?.toString();
  const lastName = form.get("last-name")?.toString();

  if (action === "edit") {
    if (!email) {
      return badRequest({ error: "Email required" });
    } else if (!firstName) {
      return badRequest({ error: "First name required" });
    } else if (!lastName) {
      return badRequest({ error: "Last name required" });
    }
    await updateEmployee(params.id, {
      email,
      firstName,
      lastName,
    });

    return redirect(UrlUtils.currentTenantUrl(params, "employees/" + params.id));
  } else if (action === "delete") {
    const existing = await getEmployee(params.id);
    if (!existing) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteEmployee(params.id);
    await createLog(request, tenantUrl, `Deleted employee`, `${existing.firstName} ${existing.lastName} (${existing.email})`);
    return redirect(UrlUtils.currentTenantUrl(params, "employees"));
  } else {
    return badRequest({ error: "Form not submitted correctly" });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function EmployeeRoute() {
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
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
      <Breadcrumb menu={[{ title: t("models.employee.plural"), routePath: UrlUtils.currentTenantUrl(params, "employees") }]} />
      {data.item ? <EmployeeProfile item={data.item} /> : <div>{t("shared.notFound")} </div>}
      <ErrorModal ref={errorModal} />
    </div>
  );
}

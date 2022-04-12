import { Tenant } from "@prisma/client";
import { useEffect, useRef } from "react";
import { ActionFunction, json, LoaderFunction, MetaFunction, useActionData, useLoaderData } from "remix";
import TenantSubscription from "~/components/core/tenants/TenantSubscription";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getTenantSubscription, TenantSubscriptionWithDetails, updateTenantSubscriptionLimits } from "~/utils/db/tenantSubscriptions.db.server";

type LoaderData = {
  title: string;
  tenant: Tenant | null;
  subscription: TenantSubscriptionWithDetails | null;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenant = await getTenant(params.id);
  const subscription = await getTenantSubscription(params.id ?? "");
  const data: LoaderData = {
    title: `${tenant?.name} ${t("admin.tenants.subscription.title")} | ${process.env.APP_NAME}`,
    tenant,
    subscription,
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

  if (!params.id) {
    return badRequest({ error: t("shared.notFound") });
  }
  const form = await request.formData();

  const maxWorkspaces = Number(form.get("max-workspaces"));
  const maxUsers = Number(form.get("max-users"));
  const maxLinks = Number(form.get("max-links"));
  const maxStorage = Number(form.get("max-storage"));
  const monthlyContracts = Number(form.get("monthly-contracts"));

  await updateTenantSubscriptionLimits(params.id, {
    maxWorkspaces,
    maxUsers,
    maxLinks,
    maxStorage,
    monthlyContracts,
  });

  return json({
    success: "Subscription updated",
  });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminTenantSubscriptionRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  // const successModal = useRef<RefSuccessModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData?.error);
    }
    // else if (actionData?.success) {
    //   successModal.current?.show(actionData.success);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <div>
      {data.tenant && <TenantSubscription tenant={data.tenant} subscription={data.subscription} />}

      {/* <SuccessModal ref={successModal} /> */}
      <ErrorModal ref={errorModal} />
    </div>
  );
}

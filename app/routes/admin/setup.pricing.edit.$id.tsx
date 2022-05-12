import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { deletePlan, updatePlan } from "~/utils/services/pricingService";
import PricingPlanForm from "~/components/core/pricing/PricingPlanForm";
import { getAllSubscriptionProducts, getSubscriptionProduct } from "~/utils/db/subscriptionProducts.db.server";
import { createAdminLog } from "~/utils/db/logs.db.server";

type LoaderData = {
  title: string;
  item: SubscriptionProductDto;
  plans: SubscriptionProductDto[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const item = await getSubscriptionProduct(params.id ?? "");
  if (!item) {
    return redirect("/admin/setup/pricing");
  }

  const data: LoaderData = {
    title: `${t("admin.pricing.edit")} | ${process.env.APP_NAME}`,
    item,
    plans: await getAllSubscriptionProducts(),
  };
  return json(data);
};

export type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "delete-plan") {
    const item = await getSubscriptionProduct(params.id ?? "");
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      await deletePlan(item);
      return redirect("/admin/setup/pricing");
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  } else if (action === "update-plan") {
    const tier = Number(form.get("tier"));
    const title = form.get("title")?.toString();
    const description = form.get("description")?.toString() ?? "";
    const badge = form.get("badge")?.toString() ?? "";
    const isPublic = Boolean(form.get("is-public"));
    const limitUsers = Number(form.get("limit-users"));
    const limitContracts = Number(form.get("limit-contracts"));

    const featuresArr = form.getAll("features[]");
    const features: { id: string; order: number; key: string; value: string; included: boolean }[] = featuresArr.map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (!title) {
      return badRequest({ error: "Title required" });
    }

    const plan: SubscriptionProductDto = {
      id: params.id,
      stripeId: "",
      tier,
      title,
      description,
      badge,
      active: true,
      public: isPublic,
      maxUsers: limitUsers,
      monthlyContracts: limitContracts,
      prices: [],
      features: [],
    };

    try {
      await updatePlan(plan, features);
      await createAdminLog(request, "Updated pricing plan", plan.translatedTitle ?? plan.title);

      return redirect("/admin/setup/pricing");
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function EditPricinPlanRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();

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
        className="w-full"
        home="/admin/dashboard"
        menu={[
          { title: t("app.sidebar.setup"), routePath: "/admin/setup" },
          { title: t("admin.pricing.title"), routePath: "/admin/setup/pricing" },
          { title: t("admin.pricing.edit"), routePath: "/admin/setup/pricing/edit" + data.item.id },
        ]}
      />
      <PricingPlanForm item={data.item} plans={data.plans} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

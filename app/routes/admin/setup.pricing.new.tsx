import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { createPlan } from "~/utils/services/pricingService";
import { createAdminUserEvent } from "~/utils/db/userEvents.db.server";
import PricingPlanForm from "~/components/core/pricing/PricingPlanForm";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";

export type LoaderData = {
  title: string;
  plans: SubscriptionProductDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const data: LoaderData = {
    title: `${t("admin.pricing.new")} | ${process.env.APP_NAME}`,
    plans: await getAllSubscriptionProducts(),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const { t } = await i18nHelper(request);
  const form = await request.formData();

  const type = form.get("type")?.toString();

  if (type !== "create-plan") {
    return badRequest({ error: t("shared.invalidForm") });
  }
  const tier = Number(form.get("tier"));
  const title = form.get("title")?.toString();
  const description = form.get("description")?.toString() ?? "";
  const badge = form.get("badge")?.toString() ?? "";
  const isPublic = Boolean(form.get("is-public"));
  const limitUsers = Number(form.get("limit-users"));
  const limitContracts = Number(form.get("limit-contracts"));
  const currency = form.get("price-currency")?.toString() ?? "usd";
  const monthlyPrice = Number(form.get("price-monthly"));
  const yearlyPrice = Number(form.get("price-yearly"));

  const featuresArr = form.getAll("features[]");
  const features: { order: number; key: string; value: string; included: boolean }[] = featuresArr.map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  if (!title) {
    return badRequest({ error: "Title required" });
  }

  const plan: SubscriptionProductDto = {
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

  const prices = [
    {
      billingPeriod: SubscriptionBillingPeriod.MONTHLY,
      price: monthlyPrice,
      currency,
    },
    {
      billingPeriod: SubscriptionBillingPeriod.YEARLY,
      price: yearlyPrice,
      currency,
    },
  ];

  try {
    await createPlan(plan, prices, features);
    await createAdminUserEvent(request, "Created pricing plan", plan.title);

    return redirect("/admin/setup/pricing");
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function NewPricinPlanRoute() {
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
          { title: t("admin.pricing.new"), routePath: "/admin/setup/pricing/new" },
        ]}
      />

      <PricingPlanForm plans={data.plans} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
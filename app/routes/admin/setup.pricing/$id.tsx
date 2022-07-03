import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import { useRef, useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useEscapeKeypress } from "~/utils/shared/KeypressUtils";
import { Transition } from "@headlessui/react";
import PricingPlanForm from "~/components/core/pricing/PricingPlanForm";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { getSubscriptionProduct } from "~/utils/db/subscriptionProducts.db.server";

export type EditPricingPlanLoaderData = {
  title: string;
  item: SubscriptionProductDto;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const item = await getSubscriptionProduct(params.id ?? "");
  if (!item) {
    return redirect("/admin/setup/pricing");
  }

  const data: EditPricingPlanLoaderData = {
    title: `${t("admin.pricing.edit")} | ${process.env.APP_NAME}`,
    item,
  };
  return json(data);
};

export type EditPricingPlanActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: EditPricingPlanActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "delete") {
    const item = await getSubscriptionProduct(params.id ?? "");
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      // await deletePlan(item);
      return redirect("/admin/setup/pricing");
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function NewPricingPlanRoute() {
  const data = useLoaderData<EditPricingPlanLoaderData>();
  const actionData = useActionData<EditPricingPlanActionData>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      successModal.current?.show(t("shared.success"), actionData.success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  useEffect(() => {
    setShowing(true);
  }, []);

  function close() {
    navigate("/admin/setup/pricing", { replace: true });
  }

  useEscapeKeypress(close);
  return (
    <div>
      <div>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
              </div>
            </Transition>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className="sm:max-w-2xl inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-left overflow-visible shadow-xl transform transition-all my-8 sm:align-middle w-full sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div className="just absolute top-0 right-0 -mt-4 pr-4">
                  <button
                    onClick={close}
                    type="button"
                    className="p-1 bg-white hover:bg-gray-200 border border-gray-200 rounded-full text-gray-600 justify-center flex items-center hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">{t("shared.close")}</span>
                    <svg
                      className="h-5 w-5 text-gray-700"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">{t("admin.pricing.new")}</h4>
                  </div>

                  <PricingPlanForm item={data.item} />
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <ErrorModal ref={errorModal} />
      <SuccessModal ref={successModal} onClosed={close} />
    </div>
  );
}

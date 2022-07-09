import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import DealsForm from "~/components/core/crm/DealsForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import { LoaderDataRowNew, loaderRowNew } from "~/modules/rows/loaders/row-new";
import { ContactWithDetails, getAllContacts } from "~/utils/db/crm/contacts.db.server";
import { createDeal } from "~/utils/db/crm/deals.db.server";
import { getEntityByName, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { SubscriptionPriceWithProduct, getSubscriptionPrices } from "~/utils/db/subscriptionProducts.db.server";
import { setRowInitialWorkflowState } from "~/utils/services/WorkflowService";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = LoaderDataRowNew & {
  contacts: ContactWithDetails[];
  subscriptionPrices: SubscriptionPriceWithProduct[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  return json({
    ...(await loaderRowNew(request, params, null, "deals", "/admin/crm/deals")),
    contacts: await getAllContacts(),
    subscriptionPrices: await getSubscriptionPrices(),
  });
};

// export const action: ActionFunction = async ({ request, params }) => {
//   return await actionRowNew(request, params, null, "deals", "/admin/crm/deals");
// };

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const entity = await getEntityByName("deal");
  if (!entity) {
    throw badRequest({ error: "Entity required: deal" });
  }
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    let subscriptionPriceId: string | undefined | null = form.get("subscription-price-id")?.toString();
    if (!subscriptionPriceId) {
      subscriptionPriceId = null;
    }
    const deal = await createDeal(entity, userInfo.userId, {
      contactId: form.get("contact")?.toString() ?? "",
      name: form.get("name")?.toString() ?? "",
      value: Number(form.get("value")),
      subscriptionPriceId,
    });
    const dealEntity = await getEntityBySlug("deals");
    if (dealEntity) {
      await setRowInitialWorkflowState(dealEntity?.id ?? "", deal.rowId);
    }
    return redirect(`/admin/crm/deals`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({ title: data?.title });

export default function AdminNewDealRoute() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <div>
      <OpenModal className="sm:max-w-md" classNameOpacity="bg-opacity-50" onClose={() => navigate(data.entityRowsRoute)}>
        <DealsForm contacts={data.contacts} subscriptionPrices={data.subscriptionPrices} />
      </OpenModal>
    </div>
  );
}

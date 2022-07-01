import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useLoaderData } from "remix";
import { badRequest } from "remix-utils";
import DealsForm from "~/components/core/crm/DealsForm";
import InputGroup from "~/components/ui/forms/InputGroup";
import { i18nHelper } from "~/locale/i18n.utils";
import { actionRowEdit } from "~/modules/rows/actions/row-edit";
import { loaderRowEdit } from "~/modules/rows/loaders/row-edit";
import RowEditRoute from "~/modules/rows/routes/RowEditRoute";
import { ContactWithDetails, getAllContacts } from "~/utils/db/crm/contacts.db.server";
import { DealWithDetails, deleteDeal, getDealByRowId, updateDeal } from "~/utils/db/crm/deals.db.server";
import { getSubscriptionPrices, SubscriptionPriceWithProduct } from "~/utils/db/subscriptionProducts.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  item: DealWithDetails;
  contacts: ContactWithDetails[];
  subscriptionPrices: SubscriptionPriceWithProduct[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const item = await getDealByRowId(params.id ?? "");
  return json({
    ...(await loaderRowEdit(request, params, null, "deals", "/admin/crm/deals")),
    item,
    contacts: await getAllContacts(),
    subscriptionPrices: await getSubscriptionPrices(),
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const existing = await getDealByRowId(params.id ?? "");
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }
  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.entity.deal.update");
    let subscriptionPriceId: string | undefined | null = form.get("subscription-price-id")?.toString();
    if (!subscriptionPriceId) {
      subscriptionPriceId = null;
    }
    await updateDeal(existing.id, {
      contactId: form.get("contact")?.toString() ?? "",
      name: form.get("name")?.toString() ?? "",
      value: Number(form.get("value")),
      subscriptionPriceId,
    });
    return json({});
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.entity.deal.delete");
    await deleteDeal(params.id ?? "");
    return redirect(`/admin/crm/deals`);
  }

  return await actionRowEdit(request, params, null, "deals", "/admin/crm/deals", existing.rowId, form);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminEditDealRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <RowEditRoute>
        <InputGroup title={"Details"}>
          <DealsForm contacts={data.contacts} subscriptionPrices={data.subscriptionPrices} item={data.item} />
        </InputGroup>
      </RowEditRoute>
    </div>
  );
}

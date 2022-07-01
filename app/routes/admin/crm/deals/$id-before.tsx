// import { ActionFunction, json, LoaderFunction, redirect, useLoaderData, useNavigate } from "remix";
// import DealsForm from "~/components/core/crm/DealsForm";
// import OpenModal from "~/components/ui/modals/OpenModal";
// import { i18nHelper } from "~/locale/i18n.utils";
// import { useAdminData } from "~/utils/data/useAdminData";
// import { ContactWithDetails, getAllContacts } from "~/utils/db/crm/contacts.db.server";
// import { DealWithDetails, deleteDeal, getDeal, updateDeal } from "~/utils/db/crm/deals.db.server";
// import { getSubscriptionPrices, SubscriptionPriceWithProduct } from "~/utils/db/subscriptionProducts.db.server";
// import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

// type LoaderData = {
//   item: DealWithDetails;
//   contacts: ContactWithDetails[];
//   subscriptionPrices: SubscriptionPriceWithProduct[];
// };
// export let loader: LoaderFunction = async ({ params }) => {
//   const item = await getDeal(params.id ?? "");
//   if (!item) {
//     return redirect("/admin/crm/deals");
//   }
//   const data: LoaderData = {
//     item,
//     contacts: await getAllContacts(),
//     subscriptionPrices: await getSubscriptionPrices(),
//   };
//   return json(data);
// };

// type ActionData = {
//   error?: string;
// };
// const badRequest = (data: ActionData) => json(data, { status: 400 });
// export const action: ActionFunction = async ({ request, params }) => {
//   const { t } = await i18nHelper(request);
//   const form = await request.formData();
//   const action = form.get("action")?.toString() ?? "";
//   const existing = await getDeal(params.id ?? "");
//   if (!existing) {
//     return badRequest({ error: t("shared.notFound") });
//   }
//   if (action === "edit") {
//     await verifyUserHasPermission(request, "admin.entity.deal.update");
//     let subscriptionPriceId: string | undefined | null = form.get("subscription-price-id")?.toString();
//     if (!subscriptionPriceId) {
//       subscriptionPriceId = null;
//     }
//     await updateDeal(existing.id, {
//       contactId: form.get("contact-id")?.toString() ?? "",
//       name: form.get("name")?.toString() ?? "",
//       value: Number(form.get("value")),
//       subscriptionPriceId,
//     });
//     return redirect(`/admin/crm/deals`);
//   } else if (action === "delete") {
//     await verifyUserHasPermission(request, "admin.entity.deal.delete");
//     await deleteDeal(params.id ?? "");
//     return redirect(`/admin/crm/deals`);
//   } else {
//     return badRequest({ error: t("shared.invalidForm") });
//   }
// };

// export default function AdminCrmDealEditRoute() {
//   const data = useLoaderData<LoaderData>();
//   const navigate = useNavigate();
//   const adminData = useAdminData();
//   return (
//     <>
//       <OpenModal className="sm:max-w-xl" onClose={() => navigate(`/admin/crm/deals`)}>
//         <DealsForm
//           contacts={data.contacts}
//           subscriptionPrices={data.subscriptionPrices}
//           item={data.item}
//           canUpdate={adminData.permissions.includes("admin.entity.deal.update")}
//           canDelete={adminData.permissions.includes("admin.entity.deal.delete")}
//         />
//       </OpenModal>
//     </>
//   );
// }

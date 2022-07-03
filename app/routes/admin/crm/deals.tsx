import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, Outlet, useLoaderData, useSearchParams } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { DealWithDetails, getAllDeals } from "~/utils/db/crm/deals.db.server";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import Tabs from "~/components/ui/tabs/Tabs";
import InputFilters from "~/components/ui/input/InputFilters";
import ViewToggleWithUrl from "~/components/ui/lists/ViewToggleWithUrl";
import DealsView from "~/components/core/crm/deals/DealsView";
import { Contact, EntityWorkflowState } from "@prisma/client";
import { getAllContacts } from "~/utils/db/crm/contacts.db.server";
import { getEntityFiltersFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { EntityWithDetails, getEntityByName } from "~/utils/db/entities/entities.db.server";
import { getWorkflowStates } from "~/utils/db/workflows/workflowStates.db.server";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  items: DealWithDetails[];
  workflowStates: EntityWorkflowState[];
  contacts: Contact[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const entity = await getEntityByName("deal");
  if (!entity) {
    throw new Error("Entity required: deal");
  }
  const filters = getEntityFiltersFromCurrentUrl(false, entity, request);
  const items = await getAllDeals(filters);

  const data: LoaderData = {
    title: `${t("models.deal.plural")} | ${process.env.APP_NAME}`,
    entity,
    items,
    contacts: await getAllContacts(),
    workflowStates: await getWorkflowStates(entity.id),
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminCrmDealsRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  return (
    <div>
      <div className="py-2 mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 space-x-2 bg-white border-b border-gray-300">
        <Tabs
          className="flex-grow"
          tabs={[
            {
              name: t("models.contact.plural"),
              routePath: "/admin/crm/contacts",
            },
            {
              name: t("models.deal.plural"),
              routePath: "/admin/crm/deals",
            },
          ]}
        />
        <div className="flex items-center space-x-1">
          {/* <InputSearchWithURL /> */}
          <ViewToggleWithUrl className="hidden sm:flex" defaultView="board" />
          {data.entity.properties.length > 0 && <InputFilters filters={[]} />}
          <ButtonPrimary to="new">
            <span className="sm:text-sm">+</span>
          </ButtonPrimary>
        </div>
      </div>

      <div className="pt-2 pb-6 space-y-2 max-w-5xl xl:max-w-7xl mx-auto px-4">
        <DealsView workflowStates={data.workflowStates} items={data.items} view={searchParams.get("view") ?? "board"} />
      </div>

      <Outlet />
    </div>
  );
}

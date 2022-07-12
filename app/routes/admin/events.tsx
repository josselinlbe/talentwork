import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ApplicationEvent } from "~/application/dtos/shared/ApplicationEvent";
import EventsTable from "~/components/core/events/EventsTable";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { EventWithAttempts, getEvents } from "~/utils/db/events/events.db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

type LoaderData = {
  items: EventWithAttempts[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};
export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.events.view");
  const current = getPaginationFromCurrentUrl(request);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "name",
      title: "Event",
      options: Object.values(ApplicationEvent).map((item) => {
        return {
          value: item,
          name: item,
        };
      }),
    },
    {
      name: "data",
      title: "Data",
    },
    {
      name: "tenantId",
      title: "models.tenant.object",
      options: (await adminGetAllTenants()).map((tenant) => {
        return {
          value: tenant.id,
          name: tenant.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await getEvents({ current, filters });

  const data: LoaderData = {
    items,
    pagination,
    filterableProperties,
  };
  return json(data);
};

export default function AdminEventsRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <IndexPageLayout
      title="Events"
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
        </>
      }
    >
      <EventsTable items={data.items} pagination={data.pagination} />
    </IndexPageLayout>
  );
}

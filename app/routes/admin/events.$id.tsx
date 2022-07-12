import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import EventDetails from "~/components/core/events/EventDetails";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { EventWithDetails, getEvent } from "~/utils/db/events/events.db.server";

type LoaderData = {
  item: EventWithDetails;
};
export let loader: LoaderFunction = async ({ params }) => {
  const item = await getEvent(params.id ?? "");
  if (!item) {
    throw redirect("/404");
  }

  const data: LoaderData = {
    item,
  };
  return json(data);
};

export default function AdminEventDetailsRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <EditPageLayout
      title="Event Details"
      menu={[
        {
          title: "Events",
          routePath: "/admin/events",
        },
        {
          title: "Details",
          routePath: "/admin/events/" + data.item.id,
        },
      ]}
    >
      <EventDetails item={data.item} />
    </EditPageLayout>
  );
}

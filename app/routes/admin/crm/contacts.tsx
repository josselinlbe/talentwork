import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Tabs from "~/components/ui/tabs/Tabs";
import RowsViewRoute from "~/routes/app.$tenant/$entity";
import { loaderRowsView } from "~/modules/rows/loaders/rows-view";

export let loader: LoaderFunction = async ({ request, params }) => {
  const data = await loaderRowsView(request, params, "contacts", null);
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminCrmContactsRoute() {
  const { t } = useTranslation();

  return (
    <div>
      <RowsViewRoute
        title={
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
        }
      />

      <Outlet />
    </div>
  );
}

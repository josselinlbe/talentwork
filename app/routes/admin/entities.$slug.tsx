import { Entity } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, Outlet, redirect, useLoaderData, useParams } from "remix";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TabsVertical from "~/components/ui/tabs/TabsVertical";
import { getEntityBySlug } from "~/utils/db/entities.db.server";

type LoaderData = {
  item: Entity;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const item = await getEntityBySlug(params.slug ?? "");
  if (!item) {
    return redirect("/admin/entities");
  }

  if (new URL(request.url).pathname === "/admin/entities/" + params.slug) {
    return redirect("/admin/entities/" + params.slug + "/details");
  }
  const data: LoaderData = {
    item,
  };
  return json(data);
};

export default function EditEntityRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  return (
    <EditPageLayout
      title={`${t(data.item.title)}`}
      menu={[
        { title: t("models.entity.plural"), routePath: "/admin/entities" },
        { title: t(data.item.title), routePath: `/admin/entities/${params.slug}/details` },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-12">
        <div className="sm:col-span-3">
          <TabsVertical
            tabs={[
              {
                name: "Details",
                routePath: `/admin/entities/${params.slug}/details`,
              },
              {
                name: "Properties",
                routePath: `/admin/entities/${params.slug}/properties`,
              },
              {
                name: "Rows",
                routePath: `/admin/entities/${params.slug}/rows`,
              },
              // {
              //   name: "Views and Forms",
              //   routePath: `/admin/entities/${params.slug}/views-and-forms`,
              // },
              {
                name: "Logs",
                routePath: `/admin/entities/${params.slug}/logs`,
              },
              {
                name: "Workflow",
                routePath: `/admin/entities/${params.slug}/workflow`,
              },
              {
                name: "Webhooks",
                routePath: `/admin/entities/${params.slug}/webhooks`,
              },
              {
                name: "API",
                routePath: `/admin/entities/${params.slug}/api`,
              },
            ]}
          />
        </div>
        <div className="sm:col-span-9">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </EditPageLayout>
  );
}

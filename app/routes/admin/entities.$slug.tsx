import { Entity } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TabsVertical from "~/components/ui/tabs/TabsVertical";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  item: Entity;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  await verifyUserHasPermission(request, "admin.entities.update");
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 xl:gap-12">
        <div className="lg:col-span-2">
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
                name: "Views",
                routePath: `/admin/entities/${params.slug}/views`,
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
        <div className="lg:col-span-10">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </EditPageLayout>
  );
}

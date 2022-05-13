import { EntityWebhook } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { json, Link, LoaderFunction, Outlet, redirect, useLoaderData } from "remix";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import FormGroup from "~/components/ui/forms/FormGroup";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getEntityBySlug } from "~/utils/db/entities.db.server";
import { EntityWebhookWithDetails, getEntityWebhooks } from "~/utils/db/entityWebhooks.db.server";

type LoaderData = {
  items: EntityWebhookWithDetails[];
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const items = await getEntityWebhooks(entity.id);
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function EditEntityIndexRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <>
      <div className="">
        <TableSimple
          headers={[
            {
              title: "Action",
              name: "action",
              value: (item) => item.action,
            },
            {
              title: "Method",
              name: "method",
              value: (item) => item.method,
            },
            {
              title: "Endpoint",
              name: "endpoint",
              className: "w-full",
              value: (item) => item.endpoint,
            },
            {
              title: "Logs",
              name: "logs",
              className: "w-full",
              value: (item) => item._count.logs,
            },
          ]}
          items={data.items}
          actions={[
            {
              title: t("shared.edit"),
              onClickRoute: (idx, item) => item.id,
            },
          ]}
        ></TableSimple>
        <div className="flex justify-start w-fu">
          <ButtonTertiary to="new">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="uppercase font-medium">{t("shared.add")}</span>
          </ButtonTertiary>
        </div>
      </div>
      <Outlet />
    </>
  );
}

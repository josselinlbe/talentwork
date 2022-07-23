import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import EntityViewForm from "~/components/entities/views/EntityViewForm";
import BreadcrumbSimple from "~/components/ui/breadcrumbs/BreadcrumbSimple";
import { i18nHelper } from "~/locale/i18n.utils";
import { getEntityBySlug, EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import {
  deleteEntityView,
  EntityViewWithDetails,
  getEntityView,
  updateEntityView,
  updateEntityViewFilters,
  updateEntityViewProperties,
  updateEntityViewSort,
} from "~/utils/db/entities/entityViews.db.server";
import EntityViewHelper from "~/utils/helpers/EntityViewHelper";

type LoaderData = {
  entity: EntityWithDetails;
  item: EntityViewWithDetails;
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }

  const item = await getEntityView(params.id ?? "");
  if (!item) {
    return redirect(`/admin/entities/${entity.slug}/views`);
  }

  const data: LoaderData = {
    entity,
    item,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }

  const item = await getEntityView(params.id ?? "");
  if (!item) {
    return redirect(`/admin/entities/${entity.slug}/views`);
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const layout = form.get("layout")?.toString() ?? "";
    const name = form.get("name")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const pageSize = Number(form.get("pageSize"));
    const order = Number(form.get("order"));
    const isDefault = Boolean(form.get("isDefault"));
    // Board
    const groupBy = form.get("groupBy")?.toString() ?? undefined;
    const groupByPropertyId = form.get("groupByPropertyId")?.toString() ?? undefined;
    // Grid
    const columns = Number(form.get("columns") ?? 0);

    const errors = [
      ...(await EntityViewHelper.validateEntityView(entity.id, isDefault, name, title, order, item)),
      ...(await EntityViewHelper.validateGroupBy(entity, layout, groupBy, groupByPropertyId)),
    ];
    if (errors.length > 0) {
      return badRequest({ error: errors.join(", ") });
    }

    const properties: { propertyId: string; order: number }[] = form.getAll("properties[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (properties.length === 0) {
      return badRequest({ error: "Add at least one property to display" });
    }

    const filters: { name: string; condition: string; value: string }[] = form.getAll("filters[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    const sort: { name: string; asc: boolean; order: number }[] = form.getAll("sort[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    try {
      await updateEntityView(item.id, {
        order,
        layout,
        name,
        title,
        isDefault,
        pageSize,
        groupByWorkflowStates: groupBy === "byWorkflowStates",
        groupByPropertyId: groupBy === "byProperty" ? groupByPropertyId ?? null : null,
        columns,
      });
      await updateEntityViewProperties(item.id, properties);
      await updateEntityViewFilters(item.id, filters);
      await updateEntityViewSort(item.id, sort);

      return redirect(`/admin/entities/${entity.slug}/views`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    try {
      await deleteEntityView(item.id);
      return redirect(`/admin/entities/${entity.slug}/views`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function EditEntityViewIndexRoute() {
  const data = useLoaderData<LoaderData>();
  const params = useParams();

  return (
    <div className="space-y-3">
      <BreadcrumbSimple
        home=""
        menu={[
          {
            title: "Views",
            routePath: `/admin/entities/${params.slug}/views`,
          },
          {
            title: "Edit",
            routePath: `/admin/entities/${params.slug}/views/${data.item.id}`,
          },
        ]}
      />

      <EntityViewForm entity={data.entity} item={data.item} />
    </div>
  );
}

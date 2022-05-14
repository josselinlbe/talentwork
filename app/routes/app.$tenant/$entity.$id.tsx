import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useTranslation } from "react-i18next";
import { ActionFunction, Link, LoaderFunction, MetaFunction, redirect, useActionData, useNavigate } from "remix";
import { json, useLoaderData, useParams } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";
import { deleteEntityRow, EntityRowWithDetails, getEntityRow, getEntityRows, updateEntityRow } from "~/utils/db/entityRows.db.server";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities.db.server";
import EntityRowsList from "~/components/entities/EntityRowsList";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import EntityRowHelper from "~/utils/helpers/EntityRowHelper";
import EntityRowForm from "~/components/entities/EntityRowForm";
import { getUserInfo } from "~/utils/session.server";
import EntityRowLogs from "~/components/entities/EntityRowLogs";
import { createEntityRowLog, createLog, getAllLogs, getEntityRowLogs, getLogs, LogWithDetails } from "~/utils/db/logs.db.server";
import clsx from "clsx";
import DropdownWithClick from "~/components/ui/dropdowns/DropdownWithClick";
import { Menu } from "@headlessui/react";
import { useEffect, useState } from "react";
import { EntityRowPropertyValueDto } from "~/application/dtos/entities/EntityRowPropertyValueDto";
import { EntityRowValue } from "@prisma/client";
import { getRelatedEntityRows } from "~/utils/services/entitiesService";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  item: EntityRowWithDetails;
  logs: LogWithDetails[];
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: EntityRowWithDetails[] }[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }
  const item = await getEntityRow(entity.id, params.id ?? "", tenantUrl.tenantId);
  if (!item) {
    return redirect(`/app/${params.tenant}/${entity.slug}`);
  }
  const relatedEntities = await getRelatedEntityRows(entity.properties, tenantUrl.tenantId);

  const logs = await getEntityRowLogs(tenantUrl.tenantId, item.id);
  EntityRowHelper.setObjectProperties(entity, item);
  const data: LoaderData = {
    title: `${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    item,
    logs,
    relatedEntities,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  const tenantUrl = await getTenantUrl(params);
  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return badRequest({ error: "Invalid entity: " + params.entity });
  }

  const item = await getEntityRow(entity.id, params.id ?? "", tenantUrl.tenantId);
  if (!item) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "edit") {
    try {
      const rowValues = EntityRowHelper.getRowPropertiesFromForm(entity, form, item);
      await updateEntityRow(item.id ?? "", {
        dynamicProperties: rowValues.dynamicProperties,
        properties: rowValues.properties,
      });
      await createEntityRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: "Updated", entity, item });
      return json({});
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "delete") {
    await deleteEntityRow(item.id);
    await createEntityRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: "Deleted", entity, item });
    return redirect(`/app/${params.tenant}/${entity.slug}`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function EntityRowsListRoute() {
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const actionData = useActionData();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [actionData]);

  useEffect(() => {
    navigate(".");
  }, [editing]);

  return (
    <EditPageLayout
      title={t(data.entity.title)}
      menu={[
        { title: t(data.entity.titlePlural), routePath: `/app/${params.tenant}/${params.entity}` },
        {
          title: t("shared.edit"),
          routePath: `/app/${params.tenant}/${params.entity}/${params.id}`,
        },
      ]}
    >
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="font-bold text-xl uppercase truncate">
          <span className="truncate">{EntityRowHelper.getRowFolio(data.entity, data.item)}</span>
        </div>
        <div className="flex justify-end items-center space-x-2">
          <div className="flex items-end space-x-2 space-y-0">
            <DropdownWithClick
              button={<div className="flex items-center space-x-2">{editing ? t("shared.cancel") : t("shared.edit")}</div>}
              onClick={() => setEditing(!editing)}
              options={
                <div>
                  <Menu.Item>
                    <Link
                      to="."
                      className="w-full text-left text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none"
                      role="menuitem"
                      tabIndex={-1}
                      id="option-menu-item-6"
                    >
                      {t("shared.reload")}
                    </Link>
                  </Menu.Item>
                </div>
              }
            />
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EntityRowForm entity={data.entity} item={data.item} editing={editing} relatedEntities={data.relatedEntities} />
        </div>
        <div className="">
          <EntityRowLogs items={data.logs} />
        </div>
      </div>
    </EditPageLayout>
  );
}

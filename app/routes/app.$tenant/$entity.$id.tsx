import { useTranslation } from "react-i18next";
import { ActionFunction, Link, LoaderFunction, MetaFunction, Outlet, redirect, useActionData } from "remix";
import { json, useLoaderData, useParams } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenantUrl } from "~/utils/services/urlService";
import { deleteRow, RowWithDetails, getRow, updateRow } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import RowHelper from "~/utils/helpers/RowHelper";
import RowForm from "~/components/entities/rows/RowForm";
import { getUserInfo } from "~/utils/session.server";
import RowLogs from "~/components/entities/rows/RowLogs";
import { createRowLog, getRowLogs, LogWithDetails } from "~/utils/db/logs.db.server";
import DropdownWithClick from "~/components/ui/dropdowns/DropdownWithClick";
import { Menu } from "@headlessui/react";
import { useEffect, useState } from "react";
import { getRelatedRows } from "~/utils/services/entitiesService";
import { getLinksWithMembers, LinkedAccountWithDetailsAndMembers } from "~/utils/db/linkedAccounts.db.server";
import { verifyUserHasPermission, getEntityPermission, getUserRowPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppData } from "~/utils/data/useAppData";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ShareIcon from "~/components/ui/icons/ShareIcon";
import { RowPermissionsDto } from "~/application/dtos/entities/RowPermissionsDto";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  item: any;
  logs: LogWithDetails[];
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[];
  linkedAccounts: LinkedAccountWithDetailsAndMembers[];
  rowPermissions: RowPermissionsDto;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }
  await verifyUserHasPermission(request, getEntityPermission(entity, "read"), tenantUrl.tenantId);

  const item = await getRow(entity.id, params.id ?? "", tenantUrl.tenantId);
  if (!item) {
    return redirect(`/app/${params.tenant}/${entity.slug}`);
  }
  const rowPermissions = await getUserRowPermission(item, tenantUrl.tenantId, userInfo.userId);

  const relatedEntities = await getRelatedRows(entity.properties, tenantUrl.tenantId);

  const logs = await getRowLogs(tenantUrl.tenantId, item.id);
  RowHelper.setObjectProperties(entity, item);

  const linkedAccounts = await getLinksWithMembers(tenantUrl.tenantId);
  const data: LoaderData = {
    title: `${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    item,
    logs,
    relatedEntities,
    linkedAccounts,
    rowPermissions,
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

  const item = await getRow(entity.id, params.id ?? "", tenantUrl.tenantId);
  if (!item) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "edit") {
    await verifyUserHasPermission(request, getEntityPermission(entity, "update"), tenantUrl.tenantId);
    try {
      const rowValues = RowHelper.getRowPropertiesFromForm(entity, form, item);
      await updateRow(item.id ?? "", {
        dynamicProperties: rowValues.dynamicProperties,
        dynamicRows: rowValues.dynamicRows,
        properties: rowValues.properties,
      });
      await createRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: "Updated", entity, item });
      return json({});
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "delete") {
    await verifyUserHasPermission(request, getEntityPermission(entity, "delete"), tenantUrl.tenantId);
    await createRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: "Deleted", entity, item });
    await deleteRow(item.id);
    return redirect(`/app/${params.tenant}/${entity.slug}`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function RowItemRoute() {
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();
  const { t } = useTranslation();
  const actionData = useActionData();

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [actionData]);

  // useEffect(() => {
  //   navigate(".");
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [editing]);

  return (
    <>
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
        {!data.rowPermissions.canRead ? (
          <div className="font-medium">You don't have permissions to view this record.</div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="font-bold text-xl uppercase truncate">
                <span className="truncate">{RowHelper.getRowFolio(data.entity, data.item)}</span>
              </div>
              <div className="flex justify-end items-center space-x-2">
                <div className="flex items-end space-x-2 space-y-0">
                  <ButtonSecondary disabled={data.item.createdByUserId !== appData.user.id} to="share">
                    <div>{t("shared.share")}</div>
                    <ShareIcon className="h-4 w-4 text-gray-500" />
                  </ButtonSecondary>
                  <DropdownWithClick
                    button={<div className="flex items-center space-x-2">{editing ? t("shared.cancel") : t("shared.edit")}</div>}
                    onClick={() => setEditing(!editing)}
                    disabled={!appData.permissions.includes(getEntityPermission(data.entity, "update")) || !data.rowPermissions.canUpdate}
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
                <RowForm
                  entity={data.entity}
                  item={data.item}
                  editing={editing}
                  relatedEntities={data.relatedEntities}
                  linkedAccounts={data.linkedAccounts}
                  canDelete={appData.permissions.includes(getEntityPermission(data.entity, "delete")) && data.rowPermissions.canDelete}
                />
              </div>
              <div className="">
                <RowLogs items={data.logs} />
              </div>
            </div>
          </>
        )}
      </EditPageLayout>
      <Outlet />
    </>
  );
}

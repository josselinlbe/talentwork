import { useTranslation } from "react-i18next";
import { ActionFunction, Link, LoaderFunction, MetaFunction, Outlet, redirect, useActionData } from "remix";
import { json, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { RowWithDetails, getRow, updateRow, deleteRow } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import RowForm from "~/components/entities/rows/RowForm";
import { createUserSession, getUserInfo } from "~/utils/session.server";
import RowLogs from "~/components/entities/rows/RowLogs";
import { createRowLog, getRowLogs, LogWithDetails } from "~/utils/db/logs.db.server";
import DropdownWithClick from "~/components/ui/dropdowns/DropdownWithClick";
import { Menu } from "@headlessui/react";
import { useEffect, useState } from "react";
import { getRelatedRows } from "~/utils/services/entitiesService";
import { getLinksWithMembers, LinkedAccountWithDetailsAndMembers } from "~/utils/db/linkedAccounts.db.server";
import { getUserRowPermission } from "~/utils/helpers/PermissionsHelper";
import { RowPermissionsDto } from "~/application/dtos/entities/RowPermissionsDto";
import { Language } from "remix-i18next";
import Header from "~/components/front/Header";

type LoaderData = {
  i18n: Record<string, Language>;
  title: string;
  entity: EntityWithDetails;
  item: any;
  logs: LogWithDetails[];
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[];
  linkedAccounts: LinkedAccountWithDetailsAndMembers[];
  rowPermissions: RowPermissionsDto;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const userInfo = await getUserInfo(request);
  if (userInfo.lightOrDarkMode === "dark") {
    return createUserSession(
      {
        userId: userInfo.userId,
        lng: userInfo.lng,
        lightOrDarkMode: "light",
      },
      new URL(request.url).pathname
    );
  }

  let { t, translations } = await i18nHelper(request);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/404");
  }

  const item = await getRow(entity.id, params.id ?? "", "");
  if (!item) {
    return redirect(`/404`);
  }
  const rowPermissions = await getUserRowPermission(item, item.tenantId, userInfo.userId);

  const relatedEntities = await getRelatedRows(entity.properties, item.tenantId);

  const logs = await getRowLogs(item.tenantId, item.id);
  RowHelper.setObjectProperties(entity, item);

  const linkedAccounts = await getLinksWithMembers(item.tenantId);
  const data: LoaderData = {
    i18n: translations,
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
  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return badRequest({ error: "Invalid entity: " + params.entity });
  }

  const item = await getRow(entity.id, params.id ?? "", "");
  if (!item) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "edit") {
    try {
      const rowValues = RowHelper.getRowPropertiesFromForm(entity, form, item);
      await updateRow(item.id ?? "", {
        dynamicProperties: rowValues.dynamicProperties,
        dynamicRows: rowValues.dynamicRows,
        properties: rowValues.properties,
      });
      await createRowLog(request, { tenantId: item.tenantId, createdByUserId: userInfo.userId, action: "Updated", entity, item });
      return json({});
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "delete") {
    await createRowLog(request, { tenantId: item.tenantId, createdByUserId: userInfo.userId, action: "Deleted", entity, item });
    await deleteRow(item.id);
    return redirect(`/`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function PublicRowItemRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const actionData = useActionData();

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [actionData]);

  return (
    <>
      <div>
        <div>
          <Header />
          <div className="bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:flex-col sm:align-center">
                <div className="relative max-w-7xl mx-auto py-12 sm:py-6 w-full overflow-hidden px-2">
                  <svg className="absolute left-full transform translate-x-1/2" width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true">
                    <defs>
                      <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-black" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
                  </svg>
                  <svg
                    className="absolute right-full bottom-0 transform -translate-x-1/2"
                    width="404"
                    height="404"
                    fill="none"
                    viewBox="0 0 404 404"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-black" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
                  </svg>
                  <div className="text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t(data.entity.title)}</h1>
                    <p className="mt-4 text-lg leading-6 text-gray-500">
                      {data.item?.tenant?.name}, {RowHelper.getRowFolio(data.entity, data.item)}
                    </p>
                  </div>
                  <div className="mt-12">
                    <div className="space-y-3 bg-gray-50 border-2 border-gray-300 border-dashed p-6">
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
                                <DropdownWithClick
                                  button={<div className="flex items-center space-x-2">{editing ? t("shared.cancel") : t("shared.edit")}</div>}
                                  onClick={() => setEditing(!editing)}
                                  disabled={!data.rowPermissions.canUpdate}
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
                                canDelete={data.rowPermissions.canDelete}
                              />
                            </div>
                            <div className="">
                              <RowLogs items={data.logs} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <Footer></Footer> */}
        </div>
        <Outlet />
      </div>
    </>
  );
}

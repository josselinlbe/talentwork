import { Menu } from "@headlessui/react";
import { EntityWorkflowStep } from "@prisma/client";
import clsx from "clsx";
import { useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useParams,
  useSubmit,
  useTransition,
} from "@remix-run/react";

import WorkflowStateBadge from "~/components/core/workflows/WorkflowStateBadge";
import RowActivity from "~/components/entities/rows/RowActivity";
import RowForm from "~/components/entities/rows/RowForm";
import RowTags from "~/components/entities/rows/RowTags";
import RowTasks from "~/components/entities/rows/RowTasks";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import DropdownWithClick from "~/components/ui/dropdowns/DropdownWithClick";
import ShareIcon from "~/components/ui/icons/ShareIcon";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import useRouteUtils from "~/utils/data/useRouteUtils";
import { getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import RowHelper from "~/utils/helpers/RowHelper";
import { LoaderDataRowEdit } from "../loaders/row-edit";

interface Props {
  children?: ReactNode;
}
export default function RowEditRoute({ children }: Props) {
  const params = useParams();
  const data = useLoaderData<LoaderDataRowEdit>();
  const appOrAdminData = useAppOrAdminData();
  const routeUtils = useRouteUtils();
  const { t } = useTranslation();
  const actionData = useActionData();
  const submit = useSubmit();
  const transition = useTransition();
  const isUpdatingWorkflowState = transition.state === "submitting" && transition.submission.formData.get("action") === "workflow-set-state";

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [actionData]);

  function onClickedWorkflowStep(step: EntityWorkflowStep) {
    const form = new FormData();
    form.set("action", "workflow-set-state");
    form.set("workflow-step-id", step.id);
    submit(form, {
      method: "post",
    });
  }

  return (
    <>
      <EditPageLayout
        title={t(data.entity.title)}
        menu={[
          { title: t(data.entity.titlePlural), routePath: routeUtils.parentRoute },
          {
            title: t("shared.edit"),
            routePath: `${params.id}`,
          },
        ]}
      >
        {!data.rowPermissions.canRead ? (
          <div className="font-medium">You don't have permissions to view this record.</div>
        ) : (
          <>
            <div className="relative space-y-2 sm:space-y-0 sm:flex items-center justify-between border-b border-gray-200 pb-4 z-10">
              <div className="flex flex-col">
                <div className="font-bold text-xl truncate flex items-center space-x-2">
                  <div className="truncate uppercase">{RowHelper.getRowFolio(data.entity, data.item)}</div>
                  {data.currentWorkflowState && (
                    <div className="">
                      <WorkflowStateBadge state={data.currentWorkflowState} />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex sm:justify-end items-center space-x-2">
                <div className="flex items-end space-x-2 space-y-0">
                  {/* {data.nextWorkflowSteps.length === 0 && data.currentWorkflowState && (
                    <ButtonSecondary disabled={true}>
                      <div className="flex items-center space-x-2">
                        <ColorBadge color={data.currentWorkflowState.color} />
                        <div>{t(data.currentWorkflowState.title)}</div>
                      </div>
                    </ButtonSecondary>
                  )} */}
                  <div className="hidden xl:flex items-end space-x-2 space-y-0">
                    {data.nextWorkflowSteps.map((step) => {
                      return (
                        <>
                          <ButtonSecondary disabled={isUpdatingWorkflowState} key={step.id} onClick={() => onClickedWorkflowStep(step)}>
                            <div className="flex items-center space-x-2">
                              <ColorBadge color={step.toState.color} />
                              <div>{t(step.action)}</div>
                            </div>
                          </ButtonSecondary>
                        </>
                      );
                    })}
                  </div>
                  <ButtonSecondary disabled={data.item.createdByUserId !== appOrAdminData?.user?.id && !appOrAdminData?.isSuperUser} to="share">
                    {/* {data.rowPermissions.visibility === Visibility.Private ? (
                      <div>{t("shared.share")}</div>
                    ) : (
                      <div>{VisibilityHelper.getVisibilityTitle(t, data.rowPermissions.visibility)}</div>
                    )} */}
                    <div>{t("shared.share")}</div>
                    <ShareIcon className="h-4 w-4 text-gray-500" />
                  </ButtonSecondary>
                  <DropdownWithClick
                    button={<div className="flex items-center space-x-2">{editing ? t("shared.cancel") : t("shared.edit")}</div>}
                    onClick={() => setEditing(!editing)}
                    disabled={!appOrAdminData?.permissions?.includes(getEntityPermission(data.entity, "update")) || !data.rowPermissions.canUpdate}
                    options={
                      <div className="z-50">
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
                        {data.nextWorkflowSteps.map((step) => {
                          return (
                            <Menu.Item key={step.id}>
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={() => onClickedWorkflowStep(step)}
                                  className={clsx(
                                    "w-full text-left flex space-x-2 items-center",
                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                    "block px-4 py-2 text-sm"
                                  )}
                                >
                                  <ColorBadge color={step.toState.color} />
                                  <div>{t(step.action)}</div>
                                </button>
                              )}
                            </Menu.Item>
                          );
                        })}
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className={clsx("lg:col-span-2")}>
                {children ?? (
                  <RowForm
                    entity={data.entity}
                    item={data.item}
                    editing={editing}
                    relatedEntities={data.relatedEntities}
                    linkedAccounts={data.linkedAccounts}
                    canDelete={appOrAdminData?.permissions?.includes(getEntityPermission(data.entity, "delete")) && data.rowPermissions.canDelete}
                  />
                )}
              </div>
              <div className="space-y-3">
                {data.entity.hasTags && <RowTags entity={data.entity} items={data.tags} />}
                {data.entity.hasTasks && <RowTasks entity={data.entity} items={data.tasks} />}
                {!data.entity.hasTags && !data.entity.hasTasks && <RowActivity entity={data.entity} items={data.logs} />}
              </div>
              {(data.entity.hasTags || data.entity.hasTasks) && (
                <div className="lg:col-span-2 pt-4">{data.rowPermissions.canComment && <RowActivity entity={data.entity} items={data.logs} />}</div>
              )}
            </div>
          </>
        )}
      </EditPageLayout>
      <Outlet />
    </>
  );
}

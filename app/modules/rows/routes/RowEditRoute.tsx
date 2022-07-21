import { Menu } from "@headlessui/react";
import { EntityWorkflowState, EntityWorkflowStep } from "@prisma/client";
import clsx from "clsx";
import { useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useActionData, useLoaderData, useParams, useSubmit, useTransition } from "@remix-run/react";
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
  title?: ReactNode;
  rowFormChildren?: ReactNode;
  afterRowForm?: ReactNode;
  hideTags?: boolean;
  hideTasks?: boolean;
  hideActivity?: boolean;
  onChangeEditing?: (editing: boolean) => void;
}
export default function RowEditRoute({ children, title, rowFormChildren, afterRowForm, hideTags, hideTasks, hideActivity, onChangeEditing }: Props) {
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

  useEffect(() => {
    if (onChangeEditing) {
      onChangeEditing(editing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function onClickedWorkflowStep(step: EntityWorkflowStep) {
    const form = new FormData();
    form.set("action", "workflow-set-state");
    form.set("workflow-step-id", step.id);
    submit(form, {
      method: "post",
    });
  }

  function onClickedWorkflowState(state: EntityWorkflowState) {
    const form = new FormData();
    form.set("action", "workflow-set-manual-state");
    form.set("workflow-state-id", state.id);
    submit(form, {
      method: "post",
    });
  }

  function canUpdate() {
    return !(isUpdatingWorkflowState || !appOrAdminData?.permissions?.includes(getEntityPermission(data.entity, "update")) || !data.rowPermissions.canUpdate);
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
          <div className="md:max-w-lg mx-auto lg:max-w-5xl">
            <div className="relative space-y-2 sm:space-y-0 sm:flex items-center justify-between border-b border-gray-200 pb-4 z-10">
              <div className="flex flex-col">
                <div className="font-bold text-xl truncate flex items-center space-x-2">
                  {title ?? (
                    <>
                      <div className="truncate uppercase">{RowHelper.getRowFolio(data.entity, data.item)}</div>
                      {data.entity.hasWorkflow && data.currentWorkflowState && (
                        <div className="">
                          <WorkflowStateBadge state={data.currentWorkflowState} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex sm:justify-end items-center space-x-2">
                <div className="flex items-end space-x-2 space-y-0">
                  <div className="hidden xl:flex items-end space-x-2 space-y-0">
                    {data.entity.hasWorkflow &&
                      data.nextWorkflowSteps.map((step) => {
                        return (
                          <>
                            <ButtonSecondary disabled={!canUpdate()} key={step.id} onClick={() => onClickedWorkflowStep(step)}>
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
                    <div>{t("shared.share")}</div>
                    <ShareIcon className="h-4 w-4 text-gray-500" />
                  </ButtonSecondary>
                  <DropdownWithClick
                    button={<div className="flex items-center space-x-2">{editing ? t("shared.cancel") : t("shared.edit")}</div>}
                    onClick={() => setEditing(!editing)}
                    disabled={!canUpdate()}
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
                        {data.entity.hasWorkflow &&
                          data.nextWorkflowSteps.map((step) => {
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

                        {appOrAdminData.isSuperUser && (
                          <>
                            <div className="border-t border-gray-200"></div>

                            {data.entity.hasWorkflow &&
                              data.entity.workflowStates.map((state) => {
                                return (
                                  <Menu.Item key={state.id}>
                                    {({ active }) => (
                                      <button
                                        type="button"
                                        onClick={() => onClickedWorkflowState(state)}
                                        className={clsx(
                                          "w-full text-left flex space-x-2 items-center",
                                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                          "block px-4 py-2 text-sm"
                                        )}
                                      >
                                        <div>
                                          <span className="font-bold text-xs">[Admin]</span> Set {t(state.title)}
                                        </div>
                                      </button>
                                    )}
                                  </Menu.Item>
                                );
                              })}
                          </>
                        )}
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 lg:flex lg:space-x-4 space-y-4 lg:space-y-0">
              <div className="lg:w-4/6 space-y-4">
                {children ?? (
                  <RowForm
                    entity={data.entity}
                    item={data.item}
                    editing={editing}
                    relatedEntities={data.relatedEntities}
                    linkedAccounts={data.linkedAccounts}
                    canDelete={appOrAdminData?.permissions?.includes(getEntityPermission(data.entity, "delete")) && data.rowPermissions.canDelete}
                  >
                    {rowFormChildren}
                  </RowForm>
                )}

                {afterRowForm}

                <div className="hidden lg:block">
                  {data.rowPermissions.canComment && !hideActivity && <RowActivity entity={data.entity} items={data.logs} />}
                </div>
              </div>
              <div className="lg:w-2/6 space-y-4">
                {data.entity.hasTags && !hideTags && <RowTags entity={data.entity} items={data.tags} />}
                {data.entity.hasTasks && !hideTasks && <RowTasks entity={data.entity} items={data.tasks} />}
              </div>
            </div>
            <div className="lg:hidden pt-4">{data.rowPermissions.canComment && !hideActivity && <RowActivity entity={data.entity} items={data.logs} />}</div>
          </div>
        )}
      </EditPageLayout>
      <Outlet />
    </>
  );
}

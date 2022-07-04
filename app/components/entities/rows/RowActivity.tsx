import { Entity } from "@prisma/client";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Form, useTransition } from "@remix-run/react";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import UserAvatarBadge from "~/components/core/users/UserAvatarBadge";
import UserBadge from "~/components/core/users/UserBadge";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import CalendarFilledIcon from "~/components/ui/icons/CalendarFilledIcon";
import ChatAltIcon from "~/components/ui/icons/ChatAltIcon";
import LightningBoltFilledIcon from "~/components/ui/icons/LightningBoltFilledIcon";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import QuestionMarkFilledIcon from "~/components/ui/icons/QuestionMarkFilledIcon";
import { useAppData } from "~/utils/data/useAppData";
import { LogWithDetails } from "~/utils/db/logs.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import RowLogComment from "./RowLogComment";
import RowLogWorkflowTransition from "./RowLogWorkflowTransition";

interface Props {
  entity: Entity;
  items: LogWithDetails[];
}

export default function RowActivity({ entity, items }: Props) {
  const { t } = useTranslation();
  const appData = useAppData();
  const transition = useTransition();
  const isAdding = transition.state === "submitting" && transition.submission.formData.get("action") === "comment";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  const sortedItems = () => {
    return items.slice().sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return x.createdAt > y.createdAt ? 1 : -1;
      }
      return 1;
    });
  };

  function getActionDescription(item: LogWithDetails) {
    return item.action;
  }
  return (
    <section className="relative">
      <div className="space-y-3">
        <div className="divide-y divide-gray-200 ">
          <div className="pb-2">
            <h2 id="activity-title" className="text-sm font-medium text-gray-900">
              {t("app.shared.activity.title")}
            </h2>
          </div>
          <div className="pt-4 space-y-6 text-xs">
            {/* Activity feed*/}
            <div className="">
              <ul className="-mb-8 space-y-6 pb-6">
                {sortedItems().map((item, idx) => (
                  <li key={item.id}>
                    <div className="relative">
                      {idx !== sortedItems().length - 1 ? <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                      <div className="relative flex items-start space-x-3">
                        {item.comment ? (
                          <>{entity.hasComments && <RowLogComment item={item} />}</>
                        ) : item.workflowTransition ? (
                          <>{entity.hasWorkflow && <RowLogWorkflowTransition item={item} />}</>
                        ) : (
                          <>
                            <div>
                              <div className="relative px-1">
                                <div className="relative">
                                  <UserAvatarBadge className="h-9 w-9" item={appData.user} />

                                  <span className="absolute -bottom-0.5 -right-1 bg-gray-50 rounded-tl px-0.5 py-px">
                                    {/* <TagIcon className="h-4 w-4 text-gray-500" aria-hidden="true" /> */}
                                    {item.action === DefaultLogActions.Created ? (
                                      <CalendarFilledIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    ) : item.action === DefaultLogActions.Updated ? (
                                      <PencilIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    ) : item.action === DefaultLogActions.WorkflowTransition ? (
                                      <LightningBoltFilledIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    ) : (
                                      <QuestionMarkFilledIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 py-0">
                              <div className=" text-gray-500">
                                <span className="mr-0.5 flex items-center space-x-1 text-sm">
                                  <div className="font-medium text-gray-900">
                                    {item.user && (
                                      <span>
                                        <UserBadge item={item.user} withEmail={false} />
                                      </span>
                                    )}
                                  </div>
                                </span>

                                <span className="mr-0.5" title={JSON.stringify(item.details) !== JSON.stringify("{}") ? item.details?.toString() : ""}>
                                  {getActionDescription(item)}
                                </span>
                                <span className="whitespace-nowrap pt-1">
                                  <time dateTime={DateUtils.dateYMDHMS(item.createdAt)}>{DateUtils.dateAgo(item.createdAt)}</time>
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {entity.hasComments && (
              <div className="">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="relative px-1">
                      <UserAvatarBadge className="h-9 w-9" item={appData.user} />

                      <span className="absolute -bottom-0.5 -right-1 bg-gray-50 rounded-tl px-0.5 py-px">
                        <ChatAltIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <Form ref={formRef} method="post" className="space-y-2">
                      <div>
                        <input hidden readOnly name="action" value="comment" />
                        <label htmlFor="comment" className="sr-only">
                          {t("shared.comment")}
                        </label>
                        <textarea
                          required
                          id="comment"
                          name="comment"
                          rows={3}
                          className="shadow-sm block w-full focus:ring-gray-900 focus:border-gray-900 sm:text-sm border border-gray-300 rounded-md"
                          placeholder={t("shared.addComment")}
                          defaultValue={""}
                        />
                      </div>
                      <div className="flex items-center justify-end space-x-4">
                        <ButtonPrimary disabled={isAdding} type="submit">
                          {t("shared.comment")}
                        </ButtonPrimary>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

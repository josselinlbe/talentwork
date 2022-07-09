import { useSubmit, useTransition } from "@remix-run/react";
import ApiKeyBadge from "~/components/core/users/ApiKeyBadge";
import UserAvatarBadge from "~/components/core/users/UserAvatarBadge";
import UserBadge from "~/components/core/users/UserBadge";
import ChatAltIcon from "~/components/ui/icons/ChatAltIcon";
import ThumbsUpEmptyIcon from "~/components/ui/icons/ThumbsUpEmptyIcon";
import ThumbsUpFilledIcon from "~/components/ui/icons/ThumbsUpFilledIcon";
import TrashEmptyIcon from "~/components/ui/icons/TrashEmptyIcon";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { LogWithDetails } from "~/utils/db/logs.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  item: LogWithDetails;
}
export default function RowLogComment({ item }: Props) {
  const submit = useSubmit();
  const { user } = useAppOrAdminData();
  const transition = useTransition();
  const isAdding = transition.state === "submitting" && transition.submission.formData.get("action") === "comment-reaction";
  const isDeleting = transition.state === "submitting" && transition.submission.formData.get("action") === "comment-delete";

  function onReacted(reaction: string) {
    const form = new FormData();
    form.set("action", "comment-reaction");
    form.set("comment-id", item.comment?.id ?? "");
    form.set("reaction", reaction);
    submit(form, {
      method: "post",
    });
  }

  function onDeleted() {
    const form = new FormData();
    form.set("action", "comment-delete");
    form.set("comment-id", item.comment?.id ?? "");
    submit(form, {
      method: "post",
    });
  }

  function getReactions(reaction: string) {
    return item.comment?.reactions.filter((f) => f.reaction === reaction);
  }
  function hasMyReaction(reaction: string) {
    return item.comment?.reactions.find((f) => f.createdByUserId === user?.id && f.reaction === reaction);
  }
  return (
    <>
      {item.comment && (
        <>
          <div className="relative px-1">
            <UserAvatarBadge className="h-9 w-9" avatar={item.user?.avatar} />

            <span className="absolute -bottom-0.5 -right-1 bg-gray-50 rounded-tl px-0.5 py-px">
              <ChatAltIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-0.5 group">
            <div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {item.user && <UserBadge item={item.user} withEmail={false} />}
                  {item.apiKey && <ApiKeyBadge item={item.apiKey} />}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 font-normal">
              {item.comment.isDeleted ? (
                <p className="text-gray-500">This comment has been deleted</p>
              ) : (
                <p className="prose border border-dashed border-gray-200 rounded-md p-2 text-sm">
                  <div dangerouslySetInnerHTML={{ __html: item.comment.value }} />
                </p>
              )}
            </div>
            <div className="text-gray-500 font-medium flex items-center justify-between space-x-1">
              {/* <div>{DateUtils.dateAgo(item.createdAt)}</div> */}
              <time dateTime={DateUtils.dateYMDHMS(item.createdAt)}>{DateUtils.dateAgo(item.createdAt)}</time>
              <div className="flex items-center space-x-2 invisible group-hover:visible">
                {!item.comment.isDeleted && item.comment.createdByUserId === user?.id && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onDeleted()}
                    className="text-gray-500 hover:text-gray-600 p-0.5 focus:outline-none"
                  >
                    <div className="flex items-center space-x-1">
                      <TrashEmptyIcon className="h-4 w-4" />
                    </div>
                  </button>
                )}
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => onReacted("like")}
                  className="text-gray-500 hover:text-gray-600 p-0.5 focus:outline-none"
                >
                  <div
                    className="flex items-center space-x-1"
                    title={
                      getReactions("like")
                        ?.map((f) => `${f.createdByUser?.firstName} ${f.createdByUser?.lastName}`)
                        .join(", ") ?? ""
                    }
                  >
                    {(getReactions("like")?.length ?? 0) > 0 && <div className="">{getReactions("like")?.length ?? 0}</div>}
                    {hasMyReaction("like") ? <ThumbsUpFilledIcon className="h-4 w-4" /> : <ThumbsUpEmptyIcon className="h-4 w-4" />}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

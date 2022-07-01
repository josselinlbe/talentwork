import { Entity } from "@prisma/client";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, useSubmit, useTransition } from "remix";
import CheckEmptyCircle from "~/components/ui/icons/CheckEmptyCircleIcon";
import CheckFilledCircleIcon from "~/components/ui/icons/CheckFilledCircleIcon";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import InputText from "~/components/ui/input/InputText";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { RowTaskWithDetails } from "~/utils/db/entities/rowTasks.db.server";

interface Props {
  entity: Entity;
  items: RowTaskWithDetails[];
}

export default function RowTasks({ entity, items }: Props) {
  const submit = useSubmit();
  const { t } = useTranslation();
  const transition = useTransition();
  const isAdding = transition.state === "submitting" && transition.submission.formData.get("action") === "task-new";
  const appOrAdminData = useAppOrAdminData();

  const formRef = useRef<HTMLFormElement>(null);

  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  function onToggleTaskCompleted(id: string) {
    const form = new FormData();
    form.set("action", "task-complete-toggle");
    form.set("task-id", id);
    submit(form, {
      method: "post",
    });
  }

  function onDeleteTask(id: string) {
    const form = new FormData();
    form.set("action", "task-delete");
    form.set("task-id", id);
    submit(form, {
      method: "post",
    });
  }

  function canDelete(item: RowTaskWithDetails) {
    return appOrAdminData.isSuperUser || (!item.completed && item.createdByUserId === appOrAdminData.user.id);
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h3 className="text-sm leading-3 font-medium text-gray-800">
          <div className="flex space-x-1 items-center">
            <CheckFilledCircleIcon className="h-4 w-4 text-gray-400" />
            <div>
              <span className=" italic font-light"></span> {t("models.rowTask.plural")}
            </div>
          </div>
        </h3>
        {items.length > 0 && (
          <div className="text-xs inline">
            <button type="button" onClick={() => setShowAddTask(true)} className="flex items-center space-x-1 text-gray-500 text-sm hover:underline">
              <PlusIcon className="h-3 w-3" />
              <div>{t("shared.addTask")}</div>
            </button>
          </div>
        )}
      </div>

      {items.length === 0 && !showAddTask && (
        <button
          type="button"
          onClick={() => setShowAddTask(true)}
          className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <span className="block text-xs font-normal text-gray-500">{t("shared.noTasks")}</span>
        </button>
      )}

      {items.length > 0 && (
        <ul className="border-2 border-gray-300 border-dashed rounded-lg p-2">
          {items.map((item) => {
            return (
              <li key={item.id} className="inline py-2">
                {/* <Link to={"tasks/" + item.id} className="relative inline-flex items-center rounded-md border border-gray-300 px-3 py-0.5">
                <span className="text-sm leading-5 font-medium text-gray-900">{item.title}</span>
              </Link>{" "} */}
                <div className="group flex space-x-1 justify-between items-center truncate">
                  <div className="flex-grow truncate flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => onToggleTaskCompleted(item.id)}
                      className="text-gray-600 hover:text-gray-700 focus:outline-none flex-shrink-0"
                    >
                      {item.completed ? <CheckFilledCircleIcon className="h-5 w-5 text-teal-500" /> : <CheckEmptyCircle className="h-5 w-5" />}
                    </button>
                    <div className="text-gray-600 text-sm truncate">{item.title}</div>
                  </div>
                  {canDelete(item) && (
                    <button
                      disabled={!canDelete(item)}
                      type="button"
                      onClick={() => onDeleteTask(item.id)}
                      className={clsx(
                        "invisible group-hover:visible text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0",
                        !canDelete(item) && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showAddTask && (
        <Form ref={formRef} method="post">
          <input hidden readOnly name="action" value="task-new" />
          <InputText
            className="w-full"
            name="task-title"
            title=""
            withLabel={false}
            placeholder="New task..."
            autoComplete="off"
            required
            button={
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5 ">
                <kbd className="bg-white inline-flex items-center border border-gray-200 rounded px-1 text-sm font-sans font-medium text-gray-500">
                  <button type="submit">
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </kbd>
              </div>
            }
          />
        </Form>
      )}
    </div>
  );
}

import { Form, useActionData, useSubmit, useTransition } from "@remix-run/react";
import clsx from "clsx";
import { t } from "i18next";
import { FormEvent, forwardRef, ReactNode, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import ButtonSecondary from "../buttons/ButtonSecondary";
import LoadingButton from "../buttons/LoadingButton";
import ConfirmModal, { RefConfirmModal } from "../modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "../modals/ErrorModal";

export interface RefFormGroup {}

interface Props {
  id: string | undefined;
  onCancel?: () => void;
  children: ReactNode;
  className?: string;
  editing?: boolean;
  confirmationPrompt?: string;
}
const FormGroup = ({ id, onCancel, children, className, editing, confirmationPrompt }: Props, ref: Ref<RefFormGroup>) => {
  useImperativeHandle(ref, () => ({}));

  const actionData = useActionData<{
    error?: string;
  }>();
  const transition = useTransition();
  const loading = transition.state === "submitting";
  const submit = useSubmit();

  const confirmRemove = useRef<RefConfirmModal>(null);
  const confirmSubmit = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  const [formData, setFormData] = useState<FormData>();

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(t("shared.error"), actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function remove() {
    confirmRemove.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function yesRemove() {
    const form = new FormData();
    form.set("action", "delete");
    form.set("id", id ?? "");
    submit(form, {
      method: "post",
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (confirmationPrompt) {
      setFormData(formData);
      confirmSubmit.current?.show(confirmationPrompt);
    } else {
      submit(formData, {
        method: "post",
      });
    }
  }

  function yesSubmit() {
    if (formData) {
      submit(formData, {
        method: "post",
      });
    }
  }

  return (
    <Form method="post" className={className} onSubmit={handleSubmit}>
      <input type="hidden" readOnly name="action" value={id ? "edit" : "create"} />
      <div className="space-y-3">
        {children}

        {(!id || editing) && (
          <div className="flex justify-between space-x-2">
            <div>
              {id && (
                <button
                  disabled={loading}
                  className={clsx(
                    "inline-flex items-center px-3 py-2 border space-x-2 border-gray-300 shadow-sm sm:text-sm font-medium sm:rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                    loading && "bg-gray-100 cursor-not-allowed"
                  )}
                  type="button"
                  onClick={remove}
                >
                  <div>{t("shared.delete")}</div>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {onCancel && (
                <ButtonSecondary onClick={onCancel} disabled={loading}>
                  <div>{t("shared.cancel")}</div>
                </ButtonSecondary>
              )}
              <LoadingButton type="submit" disabled={loading}>
                {t("shared.save")}
              </LoadingButton>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal ref={confirmSubmit} onYes={yesSubmit} />
      <ConfirmModal ref={confirmRemove} onYes={yesRemove} />
      <ErrorModal ref={errorModal} />
    </Form>
  );
};

export default forwardRef(FormGroup);

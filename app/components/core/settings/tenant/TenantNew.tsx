import { useTranslation } from "react-i18next";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState } from "react";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import { Form, useActionData, useSubmit } from "remix";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";

export default function TenantNew() {
  const actionData = useActionData();
  const { t } = useTranslation();
  const submit = useSubmit();

  const inputName = useRef<HTMLInputElement>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [name, setName] = useState("");

  useEffect(() => {
    inputName.current?.focus();
    inputName.current?.select();
  }, []);

  useEffect(() => {
    console.log({ actionData });
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    } else if (actionData?.success) {
      successModal.current?.show(actionData.success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function createdTenant() {
    if (actionData?.tenantId) {
      const form = new FormData();
      form.set("type", "set-tenant");
      form.set("tenantId", actionData.tenantId);
      form.set("redirectTo", location.pathname + location.search);
      submit(form, {
        method: "post",
        action: "/app",
      });
    }
  }

  return (
    <div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="px-4 divide-y divide-gray-200 sm:px-6">
          <div className="space-y-3 pt-6 pb-5">
            <Form method="post">
              <label className="block text-sm font-medium">{t("account.register.organization")}</label>

              <div className="mt-1 rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="tax-id" className="sr-only">
                    {t("models.workspace.name")}
                  </label>
                  <input
                    ref={inputName}
                    type="text"
                    name="name"
                    id="name"
                    placeholder={t("models.workspace.name")}
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                  />
                </div>
              </div>
            </Form>
          </div>

          <div className="space-y-4 pt-4 pb-6 text-right text-gray-700">
            <div className="text-sm leading-5 right-0">
              <span className="inline-flex rounded-sm shadow-sm ml-2">
                <LoadingButton type="submit">{t("shared.create")}</LoadingButton>
              </span>
            </div>
          </div>
        </div>
      </div>
      <SuccessModal ref={successModal} onClosed={createdTenant} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

import { Form } from "@remix-run/react";
import { Tenant } from "@prisma/client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import UploadDocuments from "~/components/ui/uploaders/UploadDocument";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputText from "~/components/ui/input/InputText";

type ActionData = {
  updateDetailsError?: string;
  success?: string;
};

interface Props {
  tenant: Tenant;
  actionData: ActionData | undefined;
  disabled: boolean;
}

export default function UpdateTenantDetailsForm({ tenant, actionData, disabled }: Props) {
  const { t } = useTranslation();

  const [icon, setIcon] = useState<string | undefined>(tenant?.icon ?? "");

  function loadedImage(image: string | undefined) {
    setIcon(image);
  }
  return (
    <Form method="post">
      <input type="hidden" name="action" value="edit" />
      <div className="shadow overflow-hidden sm:rounded-sm">
        <div className="px-4 py-5 bg-white sm:p-6">
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-6 sm:col-span-6">
              <InputText disabled={disabled} required name="name" title={t("shared.name")} value={tenant?.name} />
            </div>
            <div className="col-span-6 sm:col-span-6">
              <InputText disabled={disabled} required name="slug" title={t("shared.slug")} value={tenant?.slug} />
            </div>
            <div className="col-span-6 sm:col-span-6">
              <label htmlFor="icon" className="block text-xs leading-5 font-medium text-gray-600">
                {t("shared.icon")}
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input hidden id="icon" name="icon" defaultValue={icon} />
                <div className="h-12 w-12 rounded-md overflow-hidden">
                  {(() => {
                    if (icon) {
                      return <img id="icon" alt="Tenant icon" src={icon} />;
                    } else {
                      return (
                        <svg id="icon" className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      );
                    }
                  })()}
                </div>

                {icon ? (
                  <ButtonTertiary disabled={disabled} destructive={true} onClick={() => loadedImage("")} type="button">
                    {t("shared.delete")}
                  </ButtonTertiary>
                ) : (
                  <UploadDocuments disabled={disabled} accept="image/png, image/jpg, image/jpeg" onDropped={loadedImage} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <div className="flex justify-between">
            <div id="form-success-message" className="flex space-x-2 items-center">
              {actionData?.success ? (
                <>
                  <p className="text-teal-500 text-sm py-2" role="alert">
                    {actionData.success}
                  </p>
                </>
              ) : actionData?.updateDetailsError ? (
                <>
                  <p className="text-red-500 text-sm py-2" role="alert">
                    {actionData.updateDetailsError}
                  </p>
                </>
              ) : null}
            </div>
            <ButtonPrimary disabled={disabled} type="submit">
              {t("shared.save")}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </Form>
  );
}

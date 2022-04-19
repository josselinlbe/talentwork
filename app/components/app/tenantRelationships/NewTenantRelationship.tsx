import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import clsx from "~/utils/shared/ClassesUtils";
import { useActionData, useNavigate, useParams, useSubmit } from "remix";
import UrlUtils from "~/utils/app/UrlUtils";
import { NewTenantRelationshipActionData } from "~/routes/app.$tenant/settings/tenant-relationships.new";

interface Props {
  linksCount: number;
}

export default function NewTenantRelationship({ linksCount }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const submit = useSubmit();
  const actionData = useActionData<NewTenantRelationshipActionData>();
  const navigate = useNavigate();

  const inputEmail = useRef<HTMLInputElement>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmCreateLinkModal = useRef<RefConfirmModal>(null);

  const [imProvider, setAsProvider] = useState(false);

  const [email, setEmail] = useState("");
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    inputEmail.current?.focus();
    inputEmail.current?.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      setEmail("");
      setTenantName("");
      successModal.current?.show(t("shared.success"), actionData.success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function sendInvitation() {
    const confirmText = t("shared.invite");
    const inviteText = t("app.tenantRelationships.invitation.invite");
    if (imProvider) {
      confirmCreateLinkModal.current?.show(t("app.clients.new.add"), confirmText, t("shared.cancel"), inviteText);
    } else {
      confirmCreateLinkModal.current?.show(t("app.providers.new.add"), confirmText, t("shared.cancel"), inviteText);
    }
  }
  function confirmCreateLink() {
    const form = new FormData();
    form.set("email", email);
    form.set("tenant-name", tenantName);
    form.set("invitee-is-provider", !imProvider ? "true" : "false");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      <div className="sm:space-y-4 divide-y divide-gray-200">
        <div className="bg-white py-6 px-8 shadow-lg border border-gray-200 space-y-6">
          <div className="flex items-center space-x-3 justify-between">
            <div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {imProvider ? <span>{t("app.tenantRelationships.newClient")}</span> : <span>{t("app.tenantRelationships.newProvider")}</span>}
                </h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">{t("app.tenantRelationships.newDescription")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6 relative flex items-start select-none cursor-pointer">
              <div className="flex items-center h-5 cursor-pointer">
                <input
                  id="imProvider"
                  checked={imProvider}
                  onChange={(e) => {
                    setAsProvider(e.target.checked);
                  }}
                  aria-describedby="imProvider-description"
                  name="imProvider"
                  type="checkbox"
                  className="cursor-pointer focus:ring-theme-500 h-4 w-4 text-theme-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="imProvider" className="font-medium text-gray-700 cursor-pointer">
                  {t("app.tenantRelationships.imTheProvider")}
                </label>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 truncate">
                {t("account.shared.email")}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm w-full">
                <input
                  type="email"
                  name="email"
                  ref={inputEmail}
                  id="email"
                  autoComplete="off"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="lowercase w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="tenant-name" className="block text-xs font-medium text-gray-700 truncate">
                {t("models.tenant.object")}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm w-full">
                <input
                  type="text"
                  name="tenant-name"
                  id="tenant-name"
                  autoComplete="off"
                  required
                  value={tenantName}
                  onChange={(e) => {
                    setTenantName(e.target.value);
                  }}
                  className="w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-5">
        <div className="flex justify-end py-3 px-4 lg:px-0 lg:py-0">
          <button
            type="button"
            className={clsx(
              "ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
            )}
            onClick={sendInvitation}
          >
            {t("app.tenantRelationships.link")}
          </button>
        </div>
      </div>

      <ConfirmModal ref={confirmCreateLinkModal} onYes={confirmCreateLink} />
      <SuccessModal ref={successModal} onClosed={() => navigate(UrlUtils.currentTenantUrl(params, `settings/tenant-relationships`))} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

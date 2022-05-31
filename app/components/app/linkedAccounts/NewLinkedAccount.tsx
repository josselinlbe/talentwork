import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import clsx from "~/utils/shared/ClassesUtils";
import { useActionData, useNavigate, useParams, useSubmit } from "remix";
import UrlUtils from "~/utils/app/UrlUtils";
import { NewLinkedAccountActionData } from "~/routes/app.$tenant/settings/linked-accounts/new";
import OpenModal from "~/components/ui/modals/OpenModal";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputText, { RefInputText } from "~/components/ui/input/InputText";

interface Props {
  linksCount: number;
}

export default function NewLinkedAccount({ linksCount }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const submit = useSubmit();
  const actionData = useActionData<NewLinkedAccountActionData>();
  const navigate = useNavigate();

  const inputEmail = useRef<RefInputText>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmCreateLinkModal = useRef<RefConfirmModal>(null);

  const [imProvider, setAsProvider] = useState(false);

  const [email, setEmail] = useState("");
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    inputEmail.current?.input.current?.focus();
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
    const inviteText = t("app.linkedAccounts.invitation.invite");
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
      <OpenModal className="sm:max-w-md" onClose={() => navigate(UrlUtils.currentTenantUrl(params, `settings/linked-accounts`))}>
        <InputGroup
          title={imProvider ? t("app.linkedAccounts.newClient") : t("app.linkedAccounts.newProvider")}
          description={t("app.linkedAccounts.newDescription")}
        >
          <div className="grid grid-cols-12 gap-4">
            <InputText
              className="col-span-12"
              ref={inputEmail}
              title={t("account.shared.email")}
              type="email"
              name="email"
              autoComplete="off"
              required
              value={email}
              setValue={setEmail}
            />

            <InputText
              className="col-span-12"
              type="text"
              name="tenant-name"
              title={t("models.tenant.object")}
              autoComplete="off"
              required
              value={tenantName}
              setValue={setTenantName}
            />
            <InputCheckboxInline
              className="col-span-12"
              name="imProvider"
              title={t("app.linkedAccounts.imTheProvider")}
              value={imProvider}
              setValue={setAsProvider}
            />
          </div>
        </InputGroup>

        <div className="py-5">
          <div className="flex justify-end py-3 px-4 lg:px-0 lg:py-0">
            <button
              type="button"
              className={clsx(
                "ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
              )}
              onClick={sendInvitation}
            >
              {t("app.linkedAccounts.link")}
            </button>
          </div>
        </div>

        <ConfirmModal ref={confirmCreateLinkModal} onYes={confirmCreateLink} />
        <SuccessModal ref={successModal} onClosed={() => navigate(UrlUtils.currentTenantUrl(params, `settings/linked-accounts`))} />
        <ErrorModal ref={errorModal} />
      </OpenModal>
    </div>
  );
}

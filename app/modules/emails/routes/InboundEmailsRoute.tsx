import { useSubmit, Outlet, useLoaderData, useActionData } from "@remix-run/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EmailsTable from "~/components/core/emails/EmailsTable";
// import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputSearch from "~/components/ui/input/InputSearch";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { ActionDataEmails } from "../actions/inbound-emails";
import { LoaderDataEmails } from "../loaders/inbound-emails";

export default function InboundEmailsRoute() {
  const data = useLoaderData<LoaderDataEmails>();
  const actionData = useActionData<ActionDataEmails>();
  const submit = useSubmit();
  const { t } = useTranslation();

  const confirmModal = useRef<RefConfirmModal>(null);

  const [items] = useState(actionData?.items ?? data.items ?? []);
  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        f.fromEmail?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.fromName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.toEmail?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.toName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.subject?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.textBody?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  // function sync() {
  //   confirmModal.current?.show("Sync emails", "Sync", "Back", "IMPORTANT: Attachments cannot be retrieved this way.");
  // }

  function confirmedSync() {
    const form = new FormData();
    form.set("action", "sync");
    submit(form, { method: "post" });
  }

  return (
    <IndexPageLayout
      title={t("models.email.plural")}
      buttons={
        <div className="text-xs truncate font-normal py-2">
          <span className="select-all italic">{data.error ? <div className="text-red-500">{data.error}</div> : data.inboundEmailAddress}</span>
        </div>
      }
    >
      <div className="space-y-2">
        <div className="flex justify-between space-x-1">
          <div className="flex-grow">
            <InputSearch value={searchInput} setValue={setSearchInput} />
          </div>
          {/* <ButtonSecondary type="button" onClick={sync}>
            Sync
          </ButtonSecondary> */}
        </div>

        <EmailsTable items={filteredItems()} withTenant={true} />

        <ConfirmModal ref={confirmModal} onYes={confirmedSync} />

        <Outlet />
      </div>
    </IndexPageLayout>
  );
}

import { useTranslation } from "react-i18next";
import { ContactStatus } from "~/application/dtos/crm/ContactStatus";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import { ContactWithDetails } from "~/utils/db/crm/contacts.db.server";

interface Props {
  item?: ContactWithDetails | null;
  canUpdate?: boolean;
  canDelete?: boolean;
}
export default function ContactForm({ item, canUpdate = true, canDelete }: Props) {
  const { t } = useTranslation();

  return (
    <FormGroup id={item?.id} editing={true} canUpdate={canUpdate} canDelete={canDelete}>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <InputSelector
          disabled={!canUpdate}
          className="col-span-12"
          name="status"
          title={t("models.contact.status")}
          options={[
            { name: "Lead", value: ContactStatus.Lead },
            { name: "Prospect", value: ContactStatus.Prospect },
            { name: "Customer", value: ContactStatus.Customer },
            { name: "Partner", value: ContactStatus.Partner },
          ]}
          value={item?.status ?? ContactStatus.Lead}
          required
        />

        <InputText
          disabled={!canUpdate}
          className="col-span-12"
          name="email"
          title={t("models.contact.email")}
          value={item?.email}
          required
          autoComplete="off"
        />

        <InputText
          disabled={!canUpdate}
          className="col-span-6"
          name="first-name"
          title={t("models.contact.firstName")}
          value={item?.firstName}
          required
          autoComplete="off"
        />

        <InputText
          disabled={!canUpdate}
          className="col-span-6"
          name="last-name"
          title={t("models.contact.lastName")}
          value={item?.lastName}
          required
          autoComplete="off"
        />

        <InputText
          disabled={!canUpdate}
          className="col-span-6"
          name="company"
          title={t("models.contact.company")}
          value={item?.company ?? undefined}
          autoComplete="off"
        />

        <InputText
          disabled={!canUpdate}
          className="col-span-6"
          name="title"
          title={t("models.contact.title")}
          value={item?.title ?? undefined}
          autoComplete="off"
        />

        <InputText
          disabled={!canUpdate}
          className="col-span-12"
          name="phone"
          title={t("models.contact.phone")}
          value={item?.phone ?? undefined}
          autoComplete="off"
        />
      </div>
    </FormGroup>
  );
}

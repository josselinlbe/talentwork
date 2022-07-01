import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "remix";
import { DealStatus } from "~/application/dtos/crm/DealStatus";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputNumber from "~/components/ui/input/InputNumber";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import SubscriptionUtils from "~/utils/app/SubscriptionUtils";
import { ContactWithDetails } from "~/utils/db/crm/contacts.db.server";
import { DealWithDetails } from "~/utils/db/crm/deals.db.server";
import { SubscriptionPriceWithProduct } from "~/utils/db/subscriptionProducts.db.server";

interface Props {
  contacts: ContactWithDetails[];
  subscriptionPrices: SubscriptionPriceWithProduct[];
  item?: DealWithDetails | null;
  canUpdate?: boolean;
  canDelete?: boolean;
}
export default function DealsForm({ contacts, subscriptionPrices, item, canUpdate = true, canDelete }: Props) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [contactId, setContactId] = useState<string | number | undefined>(item?.contactId ?? undefined);
  const [name, setName] = useState<string>(item?.name ?? "");
  const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>(item?.subscriptionPriceId ?? undefined);
  const [value, setValue] = useState<number>(item?.value ? Number(item.value) : 0);

  useEffect(() => {
    if (contactId) {
      const contact = contacts.find((f) => f.id === contactId);
      if (contact) {
        setName((contact.company ?? contact.firstName ?? contact.lastName ?? "") + `' Deal`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  useEffect(() => {
    if (selectedPriceId) {
      const price = subscriptionPrices.find((f) => f.id === selectedPriceId);
      if (price) {
        setValue(price.price);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPriceId]);

  return (
    <FormGroup id={item?.id} editing={true} canUpdate={canUpdate} canDelete={canDelete}>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <InputSelector
          disabled={!canUpdate}
          className="col-span-12"
          name="contact"
          title={t("models.contact.object")}
          options={contacts.map((item) => ({
            name: `${item.firstName} ${item.lastName} (${item.email})`,
            value: item.id,
          }))}
          value={contactId}
          setValue={setContactId}
          required
        />

        <InputText disabled={!canUpdate} className="col-span-12" name="name" title={t("models.deal.name")} value={name} setValue={setName} required />

        <InputSelector
          disabled={!canUpdate}
          className="col-span-12"
          name="subscriptionPrice"
          title={t("models.deal.subscriptionPrice")}
          options={subscriptionPrices.map((item) => ({
            name: SubscriptionUtils.getPriceDescription(t, item),
            value: item.id,
          }))}
          value={selectedPriceId}
          setValue={(e) => setSelectedPriceId(e?.toString())}
        />

        <InputNumber disabled={!canUpdate} className="col-span-12" name="value" title={t("models.deal.value")} value={value} setValue={setValue} required />
      </div>
    </FormGroup>
  );
}

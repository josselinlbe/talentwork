import { EntityWebhook } from "@prisma/client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "remix";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText from "~/components/ui/input/InputText";

interface Props {
  item?: EntityWebhook;
}

export default function EntityWebhookForm({ item }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const [action, setAction] = useState<string>(item?.action ?? "Created");
  const [method, setMethod] = useState<string>(item?.method ?? "POST");
  const [endpoint, setEndpoint] = useState<string>(item?.endpoint ?? "");

  return (
    <FormGroup id={item?.id} editing={true}>
      {/* <input type="hidden" name="order" value={order} /> */}
      <InputSelect
        name="webhook-action"
        title="Action"
        value={action}
        setValue={(e) => setAction(e?.toString() ?? "")}
        options={[
          {
            name: "Created",
            value: "Created",
          },
          {
            name: "Updated",
            value: "Updated",
          },
          {
            name: "Deleted",
            value: "Deleted",
          },
        ]}
        required
      />
      <InputSelect
        name="webhook-method"
        title="Method"
        value={method}
        setValue={(e) => setMethod(e?.toString() ?? "")}
        options={[
          {
            name: "POST",
            value: "POST",
          },
          {
            name: "GET",
            value: "GET",
            disabled: true,
          },
        ]}
        required
      />
      <InputText name="webhook-endpoint" title="Endpoint" value={endpoint} setValue={setEndpoint} required />
    </FormGroup>
  );
}

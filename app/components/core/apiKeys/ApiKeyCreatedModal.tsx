import { useTranslation } from "react-i18next";
import { useNavigate } from "remix";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ClipboardIcon from "~/components/ui/icons/ClipboardIcon";
import InputText from "~/components/ui/input/InputText";
import OpenModal from "~/components/ui/modals/OpenModal";

interface Props {
  apiKey: {
    key: string;
    alias: string;
  };
  redirectTo: string;
}
export default function ApiKeyCreatedModal({ apiKey, redirectTo }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <OpenModal className="max-w-md" onClose={() => navigate(redirectTo)}>
      <div className="space-y-2">
        <div className="flex space-x-1 justify-between items-baseline">
          <h3 className="font-bold">API Key created</h3>
          <div className="text-gray-500">Alias: {apiKey.alias}</div>
        </div>
        <div className="text-sm text-gray-600">This is your only chance to see this key. Copy it and store it store it somewhere safe.</div>
        <InputText className="flex-grow select-all" disabled={true} name="" title="API Key" withLabel={false} value={apiKey.key} />
        <div className="pt-4 border-t border-gray-50">
          <ButtonPrimary className="w-full text-center flex justify-center" to={redirectTo}>
            {t("shared.acceptAndContinue")}
          </ButtonPrimary>
        </div>
      </div>
    </OpenModal>
  );
}

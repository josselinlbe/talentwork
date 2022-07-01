import { ApiKey } from "@prisma/client";
import { useTranslation } from "react-i18next";

interface Props {
  item: ApiKey;
}
export default function ApiKeyBadge({ item }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      {t("models.apiKey.object")} <span className="italic text-xs font-normal text-gray-500">{item.alias}</span>
    </div>
  );
}

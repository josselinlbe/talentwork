import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

interface Props {
  entity: EntityWithDetails;
  property: string;
  value: string;
}
export default function PropertyOptionValueBadge({ entity, property, value }: Props) {
  const { t } = useTranslation();
  function getColor() {
    const propertyOption = entity.properties.find((f) => f.name === property)?.options.find((f) => f.value === value);
    if (propertyOption) {
      return propertyOption.color;
    }
    return Colors.UNDEFINED;
  }
  return (
    <>
      <div className="flex items-center space-x-2">
        {getColor() && <ColorBadge color={getColor()} />}
        <div>{t(value ?? "")}</div>
      </div>
    </>
  );
}

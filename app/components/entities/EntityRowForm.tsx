import InputGroup from "../ui/forms/InputGroup";
import FormGroup from "../ui/forms/FormGroup";
import { EntityRowWithDetails } from "~/utils/db/entityRows.db.server";
import { EntityWithDetails } from "~/utils/db/entities.db.server";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
import EntityRowPropertyControl from "./EntityRowPropertyControl";
import { EntityRowPropertyValueDto } from "~/application/dtos/entities/EntityRowPropertyValueDto";
import EntityRowHelper from "~/utils/helpers/EntityRowHelper";
import { useTranslation } from "react-i18next";

interface Props {
  entity: EntityWithDetails;
  item?: EntityRowWithDetails | null;
  editing?: boolean;
}

export default function EntityRowForm({ entity, item, editing }: Props) {
  const { t } = useTranslation();

  const [headers, setHeaders] = useState<EntityRowPropertyValueDto[]>([]);

  useEffect(() => {
    loadInitialFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadInitialFields() {
    const initial: EntityRowPropertyValueDto[] = [];
    entity.properties
      ?.filter((f) => !f.isHidden && !f.isDetail)
      .forEach((property) => {
        const existing = item?.values.find((f) => f.entityPropertyId === property.id);
        const selectedOption = property.options.find((f) => f.value === existing?.textValue);
        initial.push({
          entityPropertyId: property.id,
          entityProperty: property,
          idValue: existing?.idValue ?? undefined,
          textValue: existing?.textValue ?? undefined,
          numberValue: existing?.numberValue ? Number(existing?.numberValue) : undefined,
          dateValue: existing?.dateValue ?? undefined,
          // relatedRequest: existing?.relatedRequest ?? undefined,
          selectedOption,
        });
      });
    setHeaders(initial);
  }

  return (
    <FormGroup
      id={item?.id}
      editing={editing}
      confirmationPrompt={
        item ? t("shared.confirmUpdate", [EntityRowHelper.getRowFolio(entity, item)]) : t("shared.confirmCreate", [t(entity.title).toLowerCase()])
      }
    >
      <InputGroup title="Details">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {headers.map((detailValue, idxDetailValue) => {
            return (
              <div key={idxDetailValue} className={clsx("w-full col-span-12", detailValue.entityProperty.type === EntityPropertyType.ENTITY && "")}>
                {detailValue.entityProperty.type === EntityPropertyType.FORMULA ? (
                  // TODO
                  <div>TODO: FORMULA CONTROLA</div>
                ) : (
                  // <FormulaControl
                  //   request={currentDynamicValues}
                  //   selected={detailValue.entityProperty}
                  //   onChange={(e) => {
                  //     updateItemByIdx(headers, setHeaders, idxDetailValue, {
                  //       textValue: e,
                  //     });
                  //   }}
                  // />
                  <EntityRowPropertyControl
                    entity={entity}
                    idValue={headers[idxDetailValue].idValue}
                    textValue={headers[idxDetailValue].textValue}
                    numberValue={headers[idxDetailValue].numberValue}
                    dateValue={headers[idxDetailValue].dateValue}
                    // relatedRequest={detailValue.relatedRequest}
                    initialOption={detailValue.selectedOption}
                    selected={detailValue.entityProperty}
                    parentSelectedValue={headers.find((f) => f.entityPropertyId == detailValue.entityProperty.parentId)}
                    onChange={(e) => {
                      updateItemByIdx(headers, setHeaders, idxDetailValue, EntityRowHelper.updateFieldValueTypeArray(headers[idxDetailValue], e));
                    }}
                    onChangeRelatedRequest={(e) => {
                      updateItemByIdx(headers, setHeaders, idxDetailValue, {
                        idValue: e?.id,
                        relatedRequest: e,
                      });
                    }}
                    onChangeOption={(e) => {
                      updateItemByIdx(headers, setHeaders, idxDetailValue, {
                        idValue: e?.id,
                        textValue: e?.value,
                        selectedOption: e,
                      });
                    }}
                    readOnly={item?.id !== undefined && !editing}
                  />
                )}
              </div>
            );
          })}
        </div>
      </InputGroup>
    </FormGroup>
  );
}

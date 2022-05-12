import { EntityProperty, EntityRowValue } from "@prisma/client";
import { useEffect, useState } from "react";
import { EntityPropertyWithDetails, EntityWithDetails } from "~/utils/db/entities.db.server";
import { EntityRowWithDetails } from "~/utils/db/entityRows.db.server";
import EntityRowHelper from "~/utils/helpers/EntityRowHelper";
import EntityRowPropertyControl from "./EntityRowPropertyControl";

interface Props {
  entity: EntityWithDetails;
  property: EntityPropertyWithDetails;
  item?: EntityRowWithDetails;
  className?: string;
}
export default function EntityRowPropertyInput({ entity, property, item, className }: Props) {
  const [headers, setHeaders] = useState<
    {
      entityPropertyId: string;
      idValue: string | undefined;
      textValue: string | undefined;
      numberValue: number | undefined;
      dateValue: Date | undefined;
    }[]
  >([]);

  useEffect(() => {
    loadInitialFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.properties]);

  function loadInitialFields() {
    const initial: {
      entityPropertyId: string;
      idValue: string | undefined;
      textValue: string | undefined;
      numberValue: number | undefined;
      dateValue: Date | undefined;
    }[] = [];
    entity.properties
      ?.filter((f) => !f.isHidden && !f.isDetail)
      .forEach((property) => {
        const existing = item?.values.find((f) => f.entityPropertyId === property.id);
        initial.push({
          entityPropertyId: property.id,
          idValue: existing?.idValue ?? undefined,
          textValue: existing?.textValue ?? "",
          numberValue: Number(existing?.numberValue) ?? undefined,
          dateValue: existing?.dateValue ?? undefined,
          // relatedRequest: existing?.relatedRequest ?? undefined,
          // selectedOption: existing?.selectedOption ?? undefined,
        });
      });
    setHeaders(initial);
  }
  return (
    <div className={className}>
      <EntityRowPropertyControl
        entity={entity}
        idValue={headers[0].idValue ?? undefined}
        textValue={headers[0].textValue ?? undefined}
        numberValue={Number(headers[0].numberValue) ?? undefined}
        dateValue={headers[0].dateValue ?? undefined}
        // relatedRequest={detailValue.relatedRequest}
        // initialOption={detailValue.selectedOption}
        selected={property}
        // parentSelectedValue={headers.find((f) => f.formFieldId == detailValue.formField.parentId)}
        // onChange={(e) => {
        //   updateItemByIdx(headers, setHeaders, idxDetailValue, updateFieldValueTypeArray(headers[idxDetailValue], e));
        // }}
        // onChangeRelatedRequest={(e) => {
        //   updateItemByIdx(headers, setHeaders, idxDetailValue, {
        //     idValue: e?.id,
        //     relatedRequest: e,
        //   });
        // }}
        // onChangeOption={(e) => {
        //   updateItemByIdx(headers, setHeaders, idxDetailValue, {
        //     idValue: e?.id,
        //     textValue: e?.value,
        //     selectedOption: e,
        //   });
        // }}
      />
    </div>
  );
}

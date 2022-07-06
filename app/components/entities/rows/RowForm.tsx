import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { forwardRef, Ref, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
import { useLocation, useSubmit } from "@remix-run/react";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputGroup from "~/components/ui/forms/InputGroup";
import RowHelper from "~/utils/helpers/RowHelper";
import RowValueInput, { RefRowValueInput } from "./RowValueInput";
import RowDetailsTable from "./RowDetailsTable";
import { RowDetailDto } from "~/application/dtos/entities/RowDetailDto";
import LinkedAccountSelector from "~/components/app/linkedAccounts/LinkedAccountSelector";
import { LinkedAccountWithDetailsAndMembers } from "~/utils/db/linkedAccounts.db.server";

export interface RefRowForm {
  create: (index: number) => void;
  update: (idx: number, item: RowDetailDto) => void;
  close: () => void;
}

interface Props {
  entity: EntityWithDetails;
  item?: RowWithDetails | null;
  editing?: boolean;
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[];
  isDetail?: boolean;
  linkedAccounts: LinkedAccountWithDetailsAndMembers[];
  onSubmit?: (values: RowValueDto[]) => void;
  canDelete?: boolean;
}

const RowForm = (
  { entity, item, editing = false, relatedEntities, isDetail = false, linkedAccounts, onSubmit = () => {}, canDelete }: Props,
  ref: Ref<RefRowForm>
) => {
  const location = useLocation();
  const submit = useSubmit();

  const rowValueInput = useRef<RefRowValueInput>(null);

  const [headers, setHeaders] = useState<RowValueDto[]>([]);
  const [, setDetails] = useState<RowDetailDto[]>([]);

  useEffect(() => {
    loadInitialFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (headers.length > 0) {
  //     rowValueInput.current?.focus();
  //   }
  // }, [headers])

  function loadInitialFields() {
    const initial: RowValueDto[] = [];
    entity.properties
      ?.filter((f) => !f.isHidden && ((isDetail && f.isDetail) || (!isDetail && !f.isDetail)))
      .forEach((property) => {
        const existing = item?.values?.find((f) => f.propertyId === property.id);
        const search = location.search;
        const preselected = new URLSearchParams(search).get(property.name);

        const selectedOption = property.options?.find((f) => f.value === (existing?.textValue ?? preselected));

        let dateValue = existing?.dateValue ?? undefined;
        // if (property.type === PropertyType.DATE && !dateValue) {
        //   dateValue = new Date();
        // }
        initial.push({
          propertyId: property.id,
          property: property,
          idValue: existing?.idValue ?? undefined,
          textValue: existing?.textValue ?? preselected ?? property.defaultValue ?? undefined,
          numberValue: existing?.numberValue ? Number(existing?.numberValue) : property.defaultValue ? Number(property.defaultValue) : undefined,
          dateValue,
          booleanValue: existing?.booleanValue ? Boolean(existing?.booleanValue) : property.defaultValue ? Boolean(property.defaultValue) : undefined,
          relatedRowId: existing?.relatedRowId ?? preselected ?? undefined,
          selectedOption,
          media: existing?.media ?? [],
        });
      });
    setHeaders(initial);
  }

  return (
    <>
      <FormGroup
        id={item?.id}
        editing={editing}
        canDelete={canDelete}
        onSubmit={(formData) =>
          isDetail
            ? onSubmit(headers)
            : submit(formData, {
                method: "post",
              })
        }
      >
        {headers.length > 0 && (
          <InputGroup title={"Details"}>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {entity.requiresLinkedAccounts && (
                <LinkedAccountSelector
                  className="col-span-12"
                  items={linkedAccounts}
                  initial={item?.linkedAccountId ?? undefined}
                  disabled={item?.id !== undefined && !editing}
                />
              )}

              {headers.map((detailValue, idxDetailValue) => {
                return (
                  <div key={idxDetailValue} className={clsx("w-full col-span-12", detailValue.property.type === PropertyType.ENTITY && "")}>
                    {/* value: {JSON.stringify(headers[idxDetailValue])} */}
                    {detailValue.property.type === PropertyType.FORMULA ? (
                      // TODO
                      <div>TODO: FORMULA CONTROLA</div>
                    ) : (
                      // <FormulaControl
                      //   request={currentDynamicValues}
                      //   selected={detailValue.property}
                      //   onChange={(e) => {
                      //     updateItemByIdx(headers, setHeaders, idxDetailValue, {
                      //       textValue: e,
                      //     });
                      //   }}
                      // />
                      <RowValueInput
                        ref={rowValueInput}
                        entity={entity}
                        idValue={headers[idxDetailValue].idValue}
                        textValue={headers[idxDetailValue].textValue}
                        numberValue={headers[idxDetailValue].numberValue}
                        dateValue={headers[idxDetailValue].dateValue}
                        booleanValue={headers[idxDetailValue].booleanValue}
                        relatedRowId={headers[idxDetailValue].relatedRowId}
                        initialOption={detailValue.selectedOption}
                        selected={detailValue.property}
                        initialMedia={detailValue.media}
                        parentSelectedValue={headers?.find((f) => f.propertyId == detailValue.property.parentId)}
                        relatedEntity={relatedEntities?.find((f) => f.propertyId === headers[idxDetailValue].propertyId)}
                        onChange={(e) => {
                          updateItemByIdx(headers, setHeaders, idxDetailValue, RowHelper.updateFieldValueTypeArray(headers[idxDetailValue], e));
                        }}
                        // onChangeRelatedRequest={(e) => {
                        //   updateItemByIdx(headers, setHeaders, idxDetailValue, {
                        //     relatedRowId: e,
                        //     // relatedRequest: e,
                        //   });
                        // }}
                        onChangeOption={(e) => {
                          updateItemByIdx(headers, setHeaders, idxDetailValue, {
                            idValue: e?.id,
                            textValue: e?.value,
                            selectedOption: e,
                          });
                        }}
                        onChangeMedia={(media) => {
                          updateItemByIdx(headers, setHeaders, idxDetailValue, {
                            media,
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
        )}
        {!isDetail && entity.properties.filter((f) => f.isDetail).length > 0 && (
          // <InputGroup title={"Details"}>
          <div className="space-y-3">
            <label className="text-sm leading-3 font-medium text-gray-800">
              <div className="flex space-x-1 items-center">
                <span className=" italic font-light"></span> Rows
              </div>
            </label>
            <div>
              <RowDetailsTable
                entity={entity}
                // currency={currency}
                properties={entity.properties.filter((f) => f.isDetail)}
                editable={!item || editing}
                initial={item?.details.sort((a, b) => a.folio - b.folio) ?? []}
                setDetails={(e) => setDetails(e)}
              />
            </div>
          </div>
          // </InputGroup>
        )}
      </FormGroup>
    </>
  );
};

export default forwardRef(RowForm);

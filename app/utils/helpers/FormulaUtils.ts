import { EntityRowValue } from "@prisma/client";
import { HyperFormula } from "hyperformula";
import { EntityRowDynamicValuesDto } from "~/application/dtos/entities/EntityRowDynamicValuesDto";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";

const options = {
  licenseKey: "gpl-v3",
  //... other options
};
// const hfInstance = HyperFormula.buildEmpty(options);

function getItemData(item: EntityRowDynamicValuesDto | undefined) {
  const data: any[][] = [];

  if (!item) {
    return data;
  }

  const requestHeaders: any[] = ["Name", "Total"];
  data.push(requestHeaders);
  data.push([item.name, item.total]);

  const headersRow: any[] = ["Header.Name", "Header.Total"];

  item.headers.forEach((value) => {
    headersRow.push(value.entityProperty?.title ?? "");
  });
  data.push(headersRow);

  const headerValuesRow: any[] = [];
  headerValuesRow.push(item.name);
  headerValuesRow.push(item.total);
  item.headers.forEach((value) => {
    headerValuesRow.push(getFieldValue(value));
  });
  data.push(headerValuesRow);

  // const detailsRow: any[] = ["Detail.Name", "Detail.Total"];
  // if (item.details.length > 0) {
  //   item.details[0].headers.forEach((value) => {
  //     detailsRow.push(value.entityProperty?.title ?? "");
  //   });
  // }
  // data.push(detailsRow);

  // item.details.forEach((detail) => {
  //   const detailsValuesRow: any[] = [];
  //   detailsValuesRow.push(detail.name);
  //   detailsValuesRow.push(detail.total);
  //   detail.headers.forEach((value) => {
  //     detailsValuesRow.push(getFieldValue(value));
  //   });

  //   data.push(detailsValuesRow);
  // });

  return data;
}

export function calculate(item: EntityRowDynamicValuesDto | undefined, formula: string | undefined) {
  if (!item || !formula) {
    return "item || formula undefined";
  }
  const itemData = getItemData(item);
  // console.log("Item Table", itemData);
  const hfInstance = HyperFormula.buildEmpty(options);
  hfInstance.addSheet("Item");
  hfInstance.setSheetContent(0, itemData);
  // return formula;

  // build an instance with defined options and data
  const formFields = item.headers?.filter((f) => f.entityProperty?.type === EntityPropertyType.ENTITY);
  formFields?.forEach((formValue) => {
    // eslint-disable-next-line no-console
    console.log("formValue", formValue);
    // TODO
    // const relatedRequestData = getItemData(formValue.relatedRequest);
    // console.log(formValue.entityProperty?.name + " Table", relatedRequestData);
    // hfInstance.addSheet(formValue.entityProperty?.name);
    // hfInstance.setSheetContent(hfInstance.countSheets() - 1, relatedRequestData);
  });
  // call getCellValue to get the calculation results
  // const mySum = hfInstance.getCellValue({ col: 3, row: 0, sheet: 0 });
  try {
    const mySum = hfInstance.calculateFormula(formula, 0);
    return mySum?.toString() ?? "0";
  } catch (e: any) {
    return e?.toString() ?? "";
  }
}

function getFieldValue(value: EntityRowValue) {
  // TODO
  // switch (getFieldValueType(value.entityProperty)) {
  //   case FormFieldValueType.ID:
  //     return value.idValue;

  //   case FormFieldValueType.TEXT:
  //     return value.textValue;

  //   case FormFieldValueType.DATE:
  //     return value.dateValue;

  //   case FormFieldValueType.NUMBER:
  //     return value.numberValue;
  // }
  return "";
}

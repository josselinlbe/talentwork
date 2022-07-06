import { Entity, Property, Row, RowMedia, RowValue } from "@prisma/client";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails } from "../db/entities/rows.db.server";
import DateUtils from "../shared/DateUtils";
import NumberUtils from "../shared/NumberUtils";
import { RowDetailDto } from "~/application/dtos/entities/RowDetailDto";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import { validatePropertyValue, validatePropertyValue_Media } from "./PropertyHelper";
import { TFunction } from "react-i18next";

const getCellValue = (entity: Entity, item: RowWithDetails, property: Property) => {
  const value = getPropertyValue(entity, item, property);
  if (property.type === PropertyType.BOOLEAN) {
    return value ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-500" />;
  }
  return getFormattedValue(value, property.type);
};

const getPropertyValue = (entity: Entity, item: RowWithDetails, property: Property) => {
  const value = item.values?.find((f) => f.propertyId === property.id);
  if (property.isDynamic && value) {
    return getDynamicPropertyValue(value, property.type);
  }
  try {
    const object = item[entity?.name as keyof typeof item];
    if (object) {
      return object[property.name as keyof typeof object];
    }
    return null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Error getting row value.`, { entity: entity?.name, property: property.name });
    return null;
  }
};

const getProperties = (entity: EntityWithDetails, item: RowWithDetails) => {
  const customProperties: any = {};
  entity.properties
    .filter((f) => !f.isHidden && !f.isDetail)
    .forEach((property) => {
      const value = getPropertyValue(entity, item, property);
      customProperties[property.name] = value;
    });
  return customProperties;
};

function getDynamicPropertyValue(item: RowValue & { media: RowMedia[] }, type: PropertyType) {
  switch (type) {
    case PropertyType.NUMBER:
      return Number(item.numberValue);
    case PropertyType.TEXT:
    case PropertyType.SELECT:
    case PropertyType.FORMULA:
      return item.textValue;
    case PropertyType.DATE:
      return item.dateValue;
    case PropertyType.BOOLEAN:
      return item.booleanValue;
    case PropertyType.ROLE:
    case PropertyType.USER:
    case PropertyType.ID:
      return item.idValue;
    case PropertyType.ENTITY:
      return item.relatedRow;
    case PropertyType.MEDIA:
      return item.media;
    // case PropertyType.SELECT:
    //   return item.selectedOption?.value ?? item.textValue;
    // case PropertyType.ENTITY:
    //   if (item.relatedRequest) {
    //     if (item.relatedRequest) {
    //       return getRequestFolio(item.relatedRequest) + " - $" + NumberUtils.decimalFormat(item.relatedRequest.total);
    //     }
    //     return "---";
    //   }
    //   return "";
    default:
      return "Not supported";
  }
}

function getDetailFormattedValue(entity: EntityWithDetails, item: RowDetailDto, property: Property) {
  const value = getPropertyValue(entity, item, property);
  if (value) {
    return getFormattedValue(value, property.type);
  }
  return "-";
}

function getFormattedValue(value: any, type: PropertyType): string {
  switch (type) {
    case PropertyType.NUMBER:
      return NumberUtils.decimalFormat(Number(value));
    case PropertyType.TEXT:
    case PropertyType.SELECT:
    case PropertyType.FORMULA:
      return value;
    case PropertyType.BOOLEAN:
      return value ? "t" : "f";
    case PropertyType.DATE:
      return DateUtils.dateYMD(value);
    case PropertyType.ROLE:
    case PropertyType.USER:
    case PropertyType.ID:
      return value;
    case PropertyType.ENTITY:
      const relatedRow = value as RowWithDetails | null;
      if (!relatedRow) {
        return "";
      }
      if (!relatedRow?.values || relatedRow?.values.length === 0) {
        return getRowFolio(relatedRow.entity, relatedRow);
      }
      const firstValue = relatedRow.values[0];
      return getDynamicPropertyValue(firstValue, firstValue.property.type);
    case PropertyType.MEDIA:
      // return (value as MediaDto[]).map((f) => f.name).join(", ");
      return value?.length ?? "0";
    // case PropertyType.SELECT:
    //   return item.selectedOption?.value ?? item.textValue;
    // case PropertyType.ENTITY:
    //   if (item.relatedRequest) {
    //     if (item.relatedRequest) {
    //       return getRequestFolio(item.relatedRequest) + " - $" + NumberUtils.decimalFormat(item.relatedRequest.total);
    //     }
    //     return "---";
    //   }
    //   return "";
    default:
      return "Not supported";
  }
}

// const getValues = (entity: EntityWithDetails, item: RowWithDetails, value: string) => {
//   const values: any[] = []
//   entity.properties.forEach((element) => {
//     const rowValue = getValue(item, element);
//     if (rowValue?.toString().toUpperCase().trim().includes(value.toUpperCase().trim())) {
//       return true;
//     }
//   });
// };

const getRowFolio = (entity: Entity, item: Row) => {
  return `${entity?.prefix}-${NumberUtils.pad(item?.folio ?? 0, 4)}`.toUpperCase();
};

const getRowDescription = (entity: EntityWithDetails, item: RowWithDetails) => {
  // const prop = entity.properties.find((f) => !f.isDefault);
  // if (prop) {
  //   const value = item.values.find((f) => f.propertyId === prop.id);
  //   return getFormattedValue(value, prop.type);
  // }
  return "?";
};

const getRowDescription2 = (entity: Entity, item: Row) => {
  return `TODO: getRowDescription2`;
};

const search = (entity: EntityWithDetails, item: RowWithDetails, searchInput: string) => {
  if (!searchInput || searchInput.trim() === "") {
    return true;
  }
  const properties = entity.properties.filter((f) => !f.isHidden);
  for (let idx = 0; idx < properties.length; idx++) {
    const property = properties[idx];
    const rowValue = getPropertyValue(entity, item, property);
    if (rowValue?.toString().toUpperCase().trim().includes(searchInput.toUpperCase().trim())) {
      return true;
    }
  }

  if (
    getRowFolio(entity, item)?.toUpperCase().includes(searchInput.toUpperCase()) ||
    item.createdByUser?.email?.toUpperCase().includes(searchInput.toUpperCase()) ||
    (item.createdByUser?.firstName + " " + item.createdByUser?.lastName)?.toUpperCase().includes(searchInput.toUpperCase())
  ) {
    return true;
  }
  return false;
};

const updateFieldValueTypeArray = (item: RowValueDto, value: any) => {
  return getValueFromType(item.property.type, value);
};

const getValueFromType = (type: PropertyType, value: any) => {
  switch (type) {
    case PropertyType.NUMBER:
      return { numberValue: value };
    case PropertyType.TEXT:
    case PropertyType.SELECT:
    case PropertyType.FORMULA:
      return { textValue: value };
    case PropertyType.DATE:
      return { dateValue: new Date(value) };
    case PropertyType.BOOLEAN:
      return { booleanValue: value === "true" || value === true };
    case PropertyType.ENTITY:
      return { relatedRowId: value };
    case PropertyType.MEDIA:
      return { media: value };
    case PropertyType.USER:
    case PropertyType.ROLE:
    case PropertyType.ID:
      return { idValue: value };
    default:
      return {};
  }
};

const setObjectProperties = (entity: EntityWithDetails, item: RowWithDetails) => {
  entity.properties
    .filter((f) => !f.isDynamic)
    .forEach((property) => {
      item.values.push({
        id: item.id,
        propertyId: property.id,
        ...getValueFromType(property.type, item[entity.name][property.name]),
      });
    });
};

const getRowPropertiesFromForm = (t: TFunction, entity: EntityWithDetails, form: FormData, existing?: RowWithDetails) => {
  const dynamicProperties: RowValueDto[] = [];
  let dynamicRows: RowDetailDto[] = [];
  const properties: any = {};

  let linkedAccountId: string | null = null;
  if (entity.requiresLinkedAccounts) {
    linkedAccountId = form.get("linked-account-id")?.toString() ?? null;
    if (!linkedAccountId) {
      throw Error(`An account link is required`);
    }
  }

  if (entity.properties.filter((f) => !f.isDynamic).length > 0) {
    if (existing) {
      Object.assign(properties, {
        [entity.name]: {
          update: {},
        },
      });
    } else {
      Object.assign(properties, {
        [entity.name]: {
          create: {},
        },
      });
    }
  }

  entity.properties
    .filter((f) => !f.isHidden && !f.isDetail)
    .forEach((property) => {
      let formValue: FormDataEntryValue | null = null;
      let media: MediaDto[] = [];
      let name = property.name;
      if (property.type === PropertyType.MEDIA || property.isDetail) {
        name += "[]";
      }
      if (property.type === PropertyType.MEDIA) {
        media = form.getAll(name).map((f: FormDataEntryValue) => {
          return JSON.parse(f.toString());
        });
        // media.forEach((mediaItem) => {
        //   console.log("title", mediaItem.title);
        //   console.log("name", mediaItem.name);
        //   console.log("type", mediaItem.type);
        // });
        validatePropertyValue_Media(t, property, media);
      } else {
        formValue = form.get(name);
        if (property.isRequired && (formValue === null || formValue === undefined)) {
          throw Error(`${t(property.title)} (${property.name}) is required`);
        }
        validatePropertyValue(t, property, formValue);
      }
      const value = getValueFromType(property.type, formValue);
      value.media = media;
      const existingValue = existing?.values?.find((f) => f.propertyId === property.id);
      if (property.isDynamic) {
        const rowValue = {
          id: existingValue?.id ?? null,
          propertyId: property.id,
          property: property,
          ...value,
        };
        if (property.isDetail) {
          // const currentRow = dynamicRows.find(2);
          // dynamicRows.push(rowValue);
        } else {
          dynamicProperties.push(rowValue);
        }
      } else {
        properties[entity.name][existing ? "update" : "create"][name] = formValue;
      }
    });

  dynamicRows = form.getAll(`rows[]`).map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString()) as RowDetailDto;
  });

  // console.log({ dynamicProperties, dynamicRows, properties });

  return {
    dynamicProperties,
    dynamicRows,
    properties,
    linkedAccountId,
  };
};

export default {
  getCellValue,
  getPropertyValue,
  getDetailFormattedValue,
  getFormattedValue,
  getRowFolio,
  getRowDescription,
  getRowDescription2,
  search,
  updateFieldValueTypeArray,
  getValueFromType,
  getProperties,
  setObjectProperties,
  getRowPropertiesFromForm,
};

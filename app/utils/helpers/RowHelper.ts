import { Entity, Property, Row, RowValue, Media } from "@prisma/client";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails } from "../db/entities/rows.db.server";
import DateUtils from "../shared/DateUtils";
import NumberUtils from "../shared/NumberUtils";
import { RowDetailDto } from "~/application/dtos/entities/RowDetailDto";

const getCellValue = (entity: Entity, item: RowWithDetails, property: Property) => {
  return getFormattedValue(getPropertyValue(entity, item, property), property.type);
};

const getPropertyValue = (entity: Entity, item: RowWithDetails, property: Property) => {
  const value = item.values.find((f) => f.propertyId === property.id);
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
    .filter((f) => !f.isHidden)
    .forEach((property) => {
      const value = getPropertyValue(entity, item, property);
      customProperties[property.name] = value;
    });
  return customProperties;
};

function getDynamicPropertyValue(item: RowValue & { media: Media[] }, type: PropertyType) {
  switch (type) {
    case PropertyType.NUMBER:
      return Number(item.numberValue);
    case PropertyType.TEXT:
    case PropertyType.SELECT:
    case PropertyType.FORMULA:
      return item.textValue;
    case PropertyType.DATE:
      return item.dateValue;
    case PropertyType.ROLE:
    case PropertyType.USER:
    case PropertyType.ID:
      return item.idValue;
    case PropertyType.ENTITY:
      return item.relatedRowId;
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
    case PropertyType.DATE:
      return DateUtils.dateYMD(value);
    case PropertyType.ROLE:
    case PropertyType.USER:
    case PropertyType.ID:
      return value;
    case PropertyType.ENTITY:
      return value;
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
  return `${entity.prefix}-${NumberUtils.pad(item?.folio ?? 0, 4)}`.toUpperCase();
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
  if (getRowFolio(entity, item)?.toUpperCase().includes(searchInput.toUpperCase())) {
    return false;
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
      console.log({ dateValue: new Date(value), value });
      return { dateValue: new Date(value) };
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

const getRowPropertiesFromForm = (entity: EntityWithDetails, form: FormData, existing?: RowWithDetails) => {
  const dynamicProperties: RowValueDto[] = [];
  const properties: any = {};
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
    .filter((f) => !f.isHidden)
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
        if (property.isRequired && media.length === 0) {
          throw Error(`${property.title} is required`);
        }
      } else {
        formValue = form.get(name);
        if (property.isRequired && (!formValue || formValue === null || formValue === undefined)) {
          throw Error(`${property.title} is required`);
        }
      }
      const value = getValueFromType(property.type, formValue);
      value.media = media;
      const existingValue = existing?.values.find((f) => f.propertyId === property.id);
      if (property.isDynamic) {
        dynamicProperties.push({
          id: existingValue?.id ?? null,
          propertyId: property.id,
          property: property,
          ...value,
        });
      } else {
        properties[entity.name][existing ? "update" : "create"][name] = formValue;
      }
    });

  let linkedAccountId: string | null = null;
  if (entity.requiresLinkedAccounts) {
    linkedAccountId = form.get("linked-account-id")?.toString() ?? null;
  }

  console.log({ dynamicProperties, properties });

  return {
    dynamicProperties,
    properties,
    linkedAccountId,
  };
};

const getApiFormat = (entity: EntityWithDetails, item: RowWithDetails | null) => {
  if (item === null) {
    return null;
  }
  return {
    id: item.id,
    createdAt: item.createdAt,
    createdByUser: item.createdByUser
      ? {
          id: item.createdByUserId,
          email: item.createdByUser?.email,
          firstName: item.createdByUser?.firstName,
          lastName: item.createdByUser?.lastName,
        }
      : null,
    folio: getRowFolio(entity, item),
    ...getProperties(entity, item),
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
  getApiFormat,
};

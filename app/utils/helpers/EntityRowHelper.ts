import { Entity, EntityProperty, EntityRow, EntityRowValue } from "@prisma/client";
import { EntityRowPropertyValueDto } from "~/application/dtos/entities/EntityRowPropertyValueDto";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import { EntityWithDetails } from "../db/entities.db.server";
import { EntityRowWithDetails } from "../db/entityRows.db.server";
import DateUtils from "../shared/DateUtils";
import NumberUtils from "../shared/NumberUtils";

const getCellValue = (entity: Entity, item: EntityRowWithDetails, property: EntityProperty) => {
  return getFormattedValue(getPropertyValue(entity, item, property), property.type);
};

const getPropertyValue = (entity: Entity, item: EntityRowWithDetails, property: EntityProperty) => {
  const value = item.values.find((f) => f.entityPropertyId === property.id);
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

const getProperties = (entity: EntityWithDetails, item: EntityRowWithDetails) => {
  const customProperties: any = {};
  entity.properties
    .filter((f) => !f.isHidden)
    .forEach((property) => {
      const value = getPropertyValue(entity, item, property);
      customProperties[property.name] = value;
    });
  return customProperties;
};

function getDynamicPropertyValue(item: EntityRowValue, type: EntityPropertyType) {
  switch (type) {
    case EntityPropertyType.NUMBER:
      return Number(item.numberValue);
    case EntityPropertyType.TEXT:
    case EntityPropertyType.SELECT:
    case EntityPropertyType.FORMULA:
      return item.textValue;
    case EntityPropertyType.DATE:
      return item.dateValue;
    case EntityPropertyType.ROLE:
    case EntityPropertyType.USER:
    case EntityPropertyType.ID:
      return item.idValue;
    // case EntityPropertyType.SELECT:
    //   return item.selectedOption?.value ?? item.textValue;
    // case EntityPropertyType.ENTITY:
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

function getFormattedValue(value: any, type: EntityPropertyType): string {
  switch (type) {
    case EntityPropertyType.NUMBER:
      return NumberUtils.decimalFormat(Number(value));
    case EntityPropertyType.TEXT:
    case EntityPropertyType.SELECT:
    case EntityPropertyType.FORMULA:
      return value;
    case EntityPropertyType.DATE:
      return DateUtils.dateYMD(value);
    case EntityPropertyType.ROLE:
    case EntityPropertyType.USER:
    case EntityPropertyType.ID:
      return value;
    // case EntityPropertyType.SELECT:
    //   return item.selectedOption?.value ?? item.textValue;
    // case EntityPropertyType.ENTITY:
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

// const getValues = (entity: EntityWithDetails, item: EntityRowWithDetails, value: string) => {
//   const values: any[] = []
//   entity.properties.forEach((element) => {
//     const rowValue = getValue(item, element);
//     if (rowValue?.toString().toUpperCase().trim().includes(value.toUpperCase().trim())) {
//       return true;
//     }
//   });
// };

const getRowFolio = (entity: Entity, item: EntityRow) => {
  return `${entity.prefix}-${NumberUtils.pad(item?.folio ?? 0, 4)}`.toUpperCase();
};

const search = (entity: EntityWithDetails, item: EntityRowWithDetails, searchInput: string) => {
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

const updateFieldValueTypeArray = (item: EntityRowPropertyValueDto, value: any) => {
  return getValueFromType(item.entityProperty.type, value);
};

const getValueFromType = (type: EntityPropertyType, value: any) => {
  switch (type) {
    case EntityPropertyType.NUMBER:
      return { numberValue: value };
    case EntityPropertyType.TEXT:
    case EntityPropertyType.SELECT:
    case EntityPropertyType.FORMULA:
      return { textValue: value };
    case EntityPropertyType.DATE:
      return { dateValue: new Date(value) };
    case EntityPropertyType.USER:
    case EntityPropertyType.ROLE:
    case EntityPropertyType.ENTITY:
    case EntityPropertyType.ID:
      return { idValue: value };
    default:
      return {};
  }
};

const setObjectProperties = (entity: EntityWithDetails, item: EntityRowWithDetails) => {
  entity.properties
    .filter((f) => !f.isDynamic)
    .forEach((property) => {
      item.values.push({
        id: item.id,
        entityPropertyId: property.id,
        ...getValueFromType(property.type, item[entity.name][property.name]),
      });
    });
};

const getRowPropertiesFromForm = (entity: EntityWithDetails, form: FormData, existing?: EntityRowWithDetails) => {
  const dynamicProperties: EntityRowPropertyValueDto[] = [];
  const properties: any = {};
  if (existing) {
    Object.assign(properties, {
      employee: {
        update: {},
      },
    });
  } else {
    Object.assign(properties, {
      employee: {
        create: {},
      },
    });
  }
  entity.properties
    .filter((f) => !f.isHidden)
    .forEach((property) => {
      const formValue = form.get(property.name);
      if (property.isRequired && (!formValue || formValue === null || formValue === undefined)) {
        throw Error(`${property.name} is required`);
      }
      const value = getValueFromType(property.type, formValue);
      const existingValue = existing?.values.find((f) => f.entityPropertyId === property.id);
      if (property.isDynamic) {
        dynamicProperties.push({
          id: existingValue?.id ?? null,
          entityPropertyId: property.id,
          entityProperty: property,
          ...value,
        });
      } else {
        properties["employee"][existing ? "update" : "create"][property.name] = formValue;
      }
    });

  let linkedAccountId: string | null = null;
  if (entity.requiresLinkedAccounts) {
    linkedAccountId = form.get("linked-account-id")?.toString() ?? null;
  }

  return {
    dynamicProperties,
    properties,
    linkedAccountId,
  };
};

const getApiFormat = (entity: EntityWithDetails, item: EntityRowWithDetails | null) => {
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
  getFormattedValue,
  getRowFolio,
  search,
  updateFieldValueTypeArray,
  getValueFromType,
  getProperties,
  setObjectProperties,
  getRowPropertiesFromForm,
  getApiFormat,
};

import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowDetailDto } from "~/application/dtos/entities/RowDetailDto";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { EntityWithDetails, PropertyWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails } from "../db/entities/rows.db.server";
import RowHelper from "./RowHelper";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import { TFunction } from "react-i18next";
import { validatePropertyValue, validatePropertyValue_Media } from "./PropertyHelper";

const generateKey = () => {
  const id: string = uuid();
  return id;
};

const hashKey = async (key: string) => {
  return await bcrypt.hash(key, 10);
};

const validateKey = async (key: string, hashedKey: string) => {
  return await bcrypt.compare(key, hashedKey);
};

const getRowPropertiesFromJson = (t: TFunction, entity: EntityWithDetails, jsonObject: any, existing?: RowWithDetails) => {
  const dynamicProperties: RowValueDto[] = [];
  let dynamicRows: RowDetailDto[] | null = [];
  const properties: any = {};

  let linkedAccountId: string | null = null;
  if (entity.requiresLinkedAccounts) {
    linkedAccountId = jsonObject["linked-account-id"]?.toString() ?? null;
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
      const propertyValue = getPropertyValueFromJson(t, property, jsonObject, existing);
      if (propertyValue?.rowValue) {
        dynamicProperties.push(propertyValue?.rowValue);
      } else if (propertyValue?.jsonValue) {
        properties[entity.name][existing ? "update" : "create"][entity.name] = propertyValue?.jsonValue;
      }
    });

  if (jsonObject[`rows[]`]) {
    jsonObject[`rows[]`]?.map((f: any) => {
      let row: RowDetailDto = {
        id: null,
        folio: null,
        values: [],
      };
      entity.properties
        .filter((f) => !f.isHidden && f.isDetail)
        .forEach((property) => {
          const propertyValue = getPropertyValueFromJson(t, property, f, existing);
          if (propertyValue?.rowValue) {
            row.values.push(propertyValue?.rowValue);
          }
          // else if (propertyValue?.formValue) {
          //   properties[entity.name][existing ? "update" : "create"][entity.name] = propertyValue?.formValue;
          // }
        });
      dynamicRows?.push(row);
      return f;
    });
  } else {
    dynamicRows = null;
  }

  // console.log({ dynamicProperties, dynamicRows, properties });

  return {
    dynamicProperties,
    dynamicRows,
    properties,
    linkedAccountId,
  };
};

function getPropertyValueFromJson(t: TFunction, property: PropertyWithDetails, object: any, existing?: RowWithDetails) {
  let jsonValue: any | null = null;
  let media: MediaDto[] = [];
  let name = property.name;
  if (property.type === PropertyType.MEDIA) {
    name += "[]";
  }
  if (property.type === PropertyType.MEDIA) {
    media =
      object[name]?.map((f: MediaDto) => {
        return f;
      }) ?? [];
    validatePropertyValue_Media(t, property, media);
  } else {
    jsonValue = object[name];
    if (property.isRequired && (jsonValue === null || jsonValue === undefined || jsonValue === "")) {
      if (property.defaultValue) {
        jsonValue = property.defaultValue;
      } else {
        if (existing && !object.hasOwnProperty(name)) {
          return null;
        }
        throw Error(`${t(property.title)} (${property.name}) is required`);
      }
    }
    validatePropertyValue(t, property, jsonValue);
  }
  const value = RowHelper.getValueFromType(property.type, jsonValue);
  value.media = media;
  const existingValue = existing?.values.find((f) => f.propertyId === property.id);
  if (property.isDynamic) {
    const rowValue: RowValueDto = {
      id: existingValue?.id ?? null,
      propertyId: property.id,
      property: property,
      ...value,
    };
    return { rowValue };
  } else {
    return { jsonValue };
  }
}

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
          email: item.createdByUser.email,
          firstName: item.createdByUser.firstName,
          lastName: item.createdByUser.lastName,
        }
      : null,
    createdByApiKey: item.createdByApiKey
      ? {
          alias: item.createdByApiKey.alias,
        }
      : null,
    folio: RowHelper.getRowFolio(entity, item),
    ...RowHelper.getProperties(entity, item),
  };
};

export default {
  generateKey,
  hashKey,
  validateKey,
  getRowPropertiesFromJson,
  getApiFormat,
};

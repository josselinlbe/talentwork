import { Property } from "@prisma/client";
import { TFunction } from "react-i18next";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PropertyWithDetails } from "../db/entities/entities.db.server";
import PropertyAttributeHelper from "./PropertyAttributeHelper";

export const validateProperty = async (name: string, title: string, properties: Property[], property?: Property | null) => {
  const errors: string[] = [];

  if (!property || property?.name !== name) {
    const existingName = properties.find((f) => f.name === name);
    if (existingName) {
      errors.push(`Existing entity with name '${name}': ${existingName.title}`);
    }
  }

  if (!property || property?.title !== title) {
    const existingTitle = properties.find((f) => f.title === title);
    if (existingTitle) {
      errors.push(`Existing entity with slug '${title}': ${existingTitle.title}`);
    }
  }

  return errors;
};

export const defaultProperties: {
  order: number;
  name: string;
  title: string;
  type: number;
  formula?: string | null;
  parentId?: string | null;
  isDefault: boolean;
  isRequired: boolean;
  isHidden: boolean;
  isDetail: boolean;
  isDynamic: boolean;
}[] = [
  {
    name: "id",
    title: "ID",
    order: 1,
    type: PropertyType.ID,
    // options: [],
    isDefault: true,
    isDetail: false,
    isRequired: false,
    isHidden: true,
    formula: undefined,
    isDynamic: true,
  },
  {
    name: "folio",
    title: "models.row.folio",
    order: 2,
    type: PropertyType.NUMBER,
    // options: [],
    isDefault: true,
    isDetail: false,
    isRequired: false,
    isHidden: true,
    formula: undefined,
    isDynamic: true,
  },
  {
    name: "createdAt",
    title: "Created at",
    order: 3,
    type: PropertyType.DATE,
    // options: [],
    isDefault: true,
    isDetail: false,
    isRequired: false,
    isHidden: true,
    formula: undefined,
    isDynamic: true,
  },
  {
    name: "createdByUser",
    title: "Created by user",
    order: 4,
    type: PropertyType.USER,
    // options: [],
    isDefault: true,
    isDetail: false,
    isRequired: false,
    isHidden: true,
    formula: undefined,
    isDynamic: true,
  },
  // {
  //   name: "role",
  //   title: "Created by role",
  //   order: 4,
  //   type: PropertyType.ROLE,
  //   // options: [],
  //   isDefault: true,
  //   isDetail: false,
  //   isRequired: false,
  //   isHidden: true,
  //   formula: undefined,
  //   isDynamic: true,
  // },
  // {
  //   name: "name",
  //   title: "Name",
  //   order: 5,
  //   type: PropertyType.TEXT,
  //   // options: [],
  //   isDefault: true,
  //   isDetail: false,
  //   isRequired: false,
  //   isHidden: true,
  //   formula: undefined,
  //   isDynamic: true,
  // },
  // {
  //   name: "total",
  //   title: "Total",
  //   order: 6,
  //   type: PropertyType.NUMBER,
  //   // options: [],
  //   isDefault: true,
  //   isDetail: false,
  //   isRequired: false,
  //   isHidden: true,
  //   formula: undefined,
  //   isDynamic: true,
  // },
];

export function validatePropertyValue(t: TFunction, property: PropertyWithDetails, value: any) {
  const max = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max);
  const min = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Min);
  if (max) {
    if (property.type === PropertyType.TEXT) {
      if (value.length > max) {
        throw Error(`${t(property.title)} (${property.name}) must have less than ${max} characters`);
      }
    } else if (property.type === PropertyType.NUMBER) {
      if (Number(value) > max) {
        throw Error(`${t(property.title)} (${property.name}) must be less than ${max}`);
      }
    }
  }
  if (min) {
    if (property.type === PropertyType.TEXT) {
      if (value.length < min) {
        throw Error(`${t(property.title)} (${property.name}) must have less than ${min} characters`);
      }
    } else if (property.type === PropertyType.NUMBER) {
      if (Number(value) < min) {
        throw Error(`${t(property.title)} (${property.name}) must be less than ${min}`);
      }
    }
  }
  return true;
}

export function validatePropertyValue_Media(t: TFunction, property: PropertyWithDetails, media: MediaDto[]) {
  const max = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max);
  const min = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Min);
  if (property.isRequired && media.length === 0) {
    throw Error(`${t(property.title)} (${property.name}) is required`);
  } else if (max && media.length > max) {
    if (max === 1) {
      throw Error(`${t(property.title)} (${property.name}) can only have one file`);
    } else {
      throw Error(`${t(property.title)} (${property.name}) cannot have more than ${max} files`);
    }
  } else if (min && media.length < min) {
    if (min === 1) {
      throw Error(`${t(property.title)} (${property.name}) must have at least one file`);
    } else {
      throw Error(`${t(property.title)} (${property.name}) must have at least ${min} files`);
    }
  }
  return true;
}

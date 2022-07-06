import { Property } from "@prisma/client";
import { TFunction } from "react-i18next";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";

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

export function validatePropertyValue(t: TFunction, property: Property, value: any) {
  if (property.max) {
    if (property.type === PropertyType.TEXT) {
      if (value.length > property.max) {
        throw Error(`${t(property.title)} (${property.name}) must have less than ${property.max} characters`);
      }
    } else if (property.type === PropertyType.NUMBER) {
      if (Number(value) > property.max) {
        throw Error(`${t(property.title)} (${property.name}) must be less than ${property.max}`);
      }
    }
  }
  if (property.min) {
    if (property.type === PropertyType.TEXT) {
      if (value.length < property.min) {
        throw Error(`${t(property.title)} (${property.name}) must have less than ${property.min} characters`);
      }
    } else if (property.type === PropertyType.NUMBER) {
      if (Number(value) < property.min) {
        throw Error(`${t(property.title)} (${property.name}) must be less than ${property.min}`);
      }
    }
  }
  return true;
}

export function validatePropertyValue_Media(t: TFunction, property: Property, media: MediaDto[]) {
  if (property.isRequired && media.length === 0) {
    throw Error(`${t(property.title)} (${property.name}) is required`);
  } else if (property.max && media.length > property.max) {
    if (property.max === 1) {
      throw Error(`${t(property.title)} (${property.name}) can only have one file`);
    } else {
      throw Error(`${t(property.title)} (${property.name}) cannot have more than ${property.max} files`);
    }
  } else if (property.min && media.length < property.min) {
    if (property.min === 1) {
      throw Error(`${t(property.title)} (${property.name}) must have at least one file`);
    } else {
      throw Error(`${t(property.title)} (${property.name}) must have at least ${property.min} files`);
    }
  }
  return true;
}

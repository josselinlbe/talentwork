import { EntityProperty } from "@prisma/client";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";

export const validateEntityProperty = async (name: string, title: string, properties: EntityProperty[], property?: EntityProperty | null) => {
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

export const defaultEntityProperties: {
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
    type: EntityPropertyType.ID,
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
    title: "models.entityRow.folio",
    order: 2,
    type: EntityPropertyType.NUMBER,
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
    type: EntityPropertyType.DATE,
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
    type: EntityPropertyType.USER,
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
  //   type: EntityPropertyType.ROLE,
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
  //   type: EntityPropertyType.TEXT,
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
  //   type: EntityPropertyType.NUMBER,
  //   // options: [],
  //   isDefault: true,
  //   isDetail: false,
  //   isRequired: false,
  //   isHidden: true,
  //   formula: undefined,
  //   isDynamic: true,
  // },
];

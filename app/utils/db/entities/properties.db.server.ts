import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import { defaultProperties } from "~/utils/helpers/PropertyHelper";
import { db } from "../../db.server";

// export async function getPropertiesBySlug(slug: string) {
//   return await db.property.findMany({
//     where: {
//       entity: {
//         slug,
//       },
//     },
//     include: {
//       options: true,
//     },
//   });
// }

export async function getProperty(id: string) {
  return await db.property.findUnique({
    where: {
      id,
    },
    include: {
      attributes: true,
      options: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function createProperty(
  data: {
    entityId: string;
    name: string;
    title: string;
    type: PropertyType;
    isDynamic: boolean;
    order: number;
    isDefault: boolean;
    isRequired: boolean;
    isHidden: boolean;
    isDetail: boolean;
    parentId: string | null;
  },
  attributes: {
    pattern?: string | null;
    min?: number | null; // TEXT, NUMBER, MEDIA
    max?: number | null; // TEXT, NUMBER, MEDIA
    maxSize?: number | null; // MEDIA (KB)
    step?: string | null; // NUMBER
    rows?: number | null; // TEXT
    defaultValue?: string | null; // TEXT, NUMBER, BOOLEAN, SELECT
    acceptFileTypes?: string | null; // MEDIA
    uppercase?: boolean | null; // TODO
    lowercase?: boolean | null; // TODO
    hintText?: string | null; // TODO
    helpText?: string | null; // TODO
    placeholder?: string | null; // TODO
    icon?: string | null; // TODO
  }
) {
  if (data.name.includes(" ")) {
    throw Error("Property names cannot contain spaces");
  }
  if (data.name.includes("-")) {
    throw Error("Property names cannot contain: -");
  }
  let createAttributes = {};
  if (attributes) {
    createAttributes = {
      attributes: {
        create: attributes,
      },
    };
  }
  return await db.property.create({
    data: {
      ...data,
      ...createAttributes,
    },
  });
}

export type CreatePropertyDto = {
  name: string;
  title: string;
  type: PropertyType;
  isDynamic: boolean;
  isRequired?: boolean;
  isDefault?: boolean;
  parentId?: string | null;
  options?: { order: number; value: string; name?: string; color?: Colors }[];
  attributes?: {
    pattern?: string | null;
    min?: number | null; // TEXT, NUMBER, MEDIA
    max?: number | null; // TEXT, NUMBER, MEDIA
    maxSize?: number | null; // MEDIA (KB)
    step?: string | null; // NUMBER
    rows?: number | null; // TEXT
    defaultValue?: string | null; // TEXT, NUMBER, BOOLEAN, SELECT
    acceptFileTypes?: string | null; // MEDIA
    uppercase?: boolean | null; // TODO
    lowercase?: boolean | null; // TODO
    hintText?: string | null; // TODO
    helpText?: string | null; // TODO
    placeholder?: string | null; // TODO
    icon?: string | null; // TODO
  };
};
export async function createProperties(entityId: string, fields: CreatePropertyDto[]) {
  return await Promise.all(
    fields.map(async (field, idx) => {
      const property = await createProperty(
        {
          entityId,
          order: defaultProperties.length + idx + 1,
          name: field.name,
          title: field.title,
          type: field.type,
          isDynamic: field.isDynamic,
          isRequired: field.isRequired ?? true,
          isDefault: field.isDefault ?? false,
          isHidden: false,
          isDetail: false,
          parentId: field.parentId ?? null,
        },
        {
          // Attributes
          pattern: field.attributes?.pattern ?? null,
          min: field.attributes?.min ?? null,
          max: field.attributes?.max ?? null,
          maxSize: field.attributes?.maxSize ?? null,
          step: field.attributes?.step ?? null,
          rows: field.attributes?.rows ?? null,
          defaultValue: field.attributes?.defaultValue ?? null,
          acceptFileTypes: field.attributes?.acceptFileTypes ?? null,
          uppercase: field.attributes?.uppercase ?? null,
          lowercase: field.attributes?.lowercase ?? null,
          hintText: field.attributes?.hintText ?? null,
          helpText: field.attributes?.helpText ?? null,
          placeholder: field.attributes?.placeholder ?? null,
          icon: field.attributes?.icon ?? null,
        }
      );

      if (field.options) {
        await updatePropertyOptions(
          property.id,
          field.options.map((option) => {
            return {
              order: option.order,
              value: option.value,
              name: option.name ?? null,
              color: option.color,
            };
          })
        );
      }
      return property;
    })
  );
}

export async function updateProperty(
  id: string,
  data: {
    name: string;
    title: string;
    type: PropertyType;
    isDynamic: boolean;
    order: number;
    isDefault: boolean;
    isRequired: boolean;
    isHidden: boolean;
    isDetail: boolean;
    parentId: string | null;
  },
  attributes?: {
    pattern?: string | null;
    min?: number | null; // TEXT, NUMBER, MEDIA
    max?: number | null; // TEXT, NUMBER, MEDIA
    step?: string | null; // NUMBER
    rows?: number | null; // TEXT
    defaultValue?: string | null; // TEXT, NUMBER, BOOLEAN, SELECT
    maxSize?: number | null; // MEDIA (KB)
    acceptFileTypes?: string | null; // MEDIA
    uppercase?: boolean | null; // TODO
    lowercase?: boolean | null; // TODO
    hintText?: string | null; // TODO
    helpText?: string | null; // TODO
    placeholder?: string | null; // TODO
    icon?: string | null; // TODO
  }
) {
  if (data.name.includes(" ")) {
    throw Error("Property names cannot contain spaces");
  }
  if (data.name.includes("-")) {
    throw Error("Property names cannot contain: -");
  }
  const property = await db.property.update({
    where: { id },
    data: {
      ...data,
      attributes: {
        update: {
          ...attributes,
        },
      },
    },
  });

  return property;
}

export async function updatePropertyOptions(id: string, options: { order: number; value: string; name?: string | null; color?: Colors }[]) {
  await db.propertyOption.deleteMany({
    where: { propertyId: id },
  });
  Promise.all(
    options.map(async (option) => {
      return await db.propertyOption.create({
        data: {
          propertyId: id,
          order: option.order,
          value: option.value,
          name: option.name ?? null,
          color: option.color,
        },
      });
    })
  );
}

export async function deleteProperty(id: string) {
  return await db.property.delete({
    where: { id },
  });
}

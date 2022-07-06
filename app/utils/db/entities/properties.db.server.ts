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
      options: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function createProperty(data: {
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
  pattern: string;
  parentId: string | null;
  min: number | null;
  max: number | null;
  step: string | null;
  rows: number | null;
  defaultValue: string | null;
  acceptFileTypes: string | null;
}) {
  if (data.name.includes(" ")) {
    throw Error("Property names cannot contain spaces");
  }
  if (data.name.includes("-")) {
    throw Error("Property names cannot contain: -");
  }
  return await db.property.create({
    data,
  });
}

export async function createProperties(
  entityId: string,
  fields: {
    name: string;
    title: string;
    type: PropertyType;
    isDynamic: boolean;
    isRequired?: boolean;
    isDefault?: boolean;
    parentId?: string | null;
    options?: { order: number; value: string; name?: string; color?: Colors }[];
    min?: number | null;
    max?: number | null;
    step?: string | null;
    rows?: number | null;
    defaultValue?: string | null;
    acceptFileTypes?: string | null;
    // addedByRoles:
  }[]
) {
  return await Promise.all(
    fields.map(async (field, idx) => {
      const property = await createProperty({
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
        pattern: "",
        parentId: field.parentId ?? null,
        min: field.min ?? null,
        max: field.max ?? null,
        step: field.step ?? null,
        rows: field.rows ?? null,
        defaultValue: field.defaultValue ?? null,
        acceptFileTypes: field.acceptFileTypes ?? null,
      });

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
    pattern: string;
    parentId: string | null;
    min: number | null;
    max: number | null;
    step: string | null;
    rows: number | null;
    defaultValue: string | null;
    acceptFileTypes: string | null;
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
    data,
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

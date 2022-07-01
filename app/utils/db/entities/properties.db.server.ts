import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
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

export async function updatePropertyOptions(id: string, options: { order: number; value: string; color?: Colors }[]) {
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

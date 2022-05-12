import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import { db } from "../db.server";

// export async function getEntityPropertiesBySlug(slug: string) {
//   return await db.entityProperty.findMany({
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

export async function getEntityProperty(id: string) {
  return await db.entityProperty.findUnique({
    where: {
      id,
    },
    include: {
      options: true,
    },
  });
}

export async function createEntityProperty(data: {
  entityId: string;
  name: string;
  title: string;
  type: EntityPropertyType;
  isDynamic: boolean;
  order: number;
  isDefault: boolean;
  isRequired: boolean;
  isHidden: boolean;
  isDetail: boolean;
  pattern: string;
}) {
  if (data.name.includes(" ")) {
    throw Error("Property names cannot contain spaces");
  }
  if (data.name.includes("-")) {
    throw Error("Property names cannot contain: -");
  }
  return await db.entityProperty.create({
    data,
  });
}

export async function updateEntityProperty(
  id: string,
  data: {
    name: string;
    title: string;
    type: EntityPropertyType;
    isDynamic: boolean;
    order: number;
    isDefault: boolean;
    isRequired: boolean;
    isHidden: boolean;
    isDetail: boolean;
    pattern: string;
  }
) {
  if (data.name.includes(" ")) {
    throw Error("Property names cannot contain spaces");
  }
  if (data.name.includes("-")) {
    throw Error("Property names cannot contain: -");
  }
  const property = await db.entityProperty.update({
    where: { id },
    data,
  });

  return property;
}

export async function updateEntityPropertyOptions(id: string, options: { order: number; value: string }[]) {
  console.log({
    id,
    options: JSON.stringify(options),
  });
  await db.entityPropertyOption.deleteMany({
    where: { entityPropertyId: id },
  });
  Promise.all(
    options.map(async (option) => {
      console.log({
        entityPropertyId: id,
        order: option.order,
        value: option.value,
      });
      return await db.entityPropertyOption.create({
        data: {
          entityPropertyId: id,
          order: option.order,
          value: option.value,
        },
      });
    })
  );
}

export async function deleteEntityProperty(id: string) {
  return await db.entityProperty.delete({
    where: { id },
  });
}

// import { Entity, Property } from "@prisma/client";
// import { FiltersDto } from "~/application/dtos/data/FiltersDto";
// import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
// import { SortedByDto } from "~/application/dtos/data/SortedByDto";
// import { PropertyType } from "~/application/enums/entities/PropertyType";

// const getRowSortCondition = (sortedBy?: SortedByDto[]) => {
//   let orderBy: any = { folio: "desc" };
//   if (sortedBy && sortedBy.length > 0) {
//     orderBy = [];
//     sortedBy.forEach((item) => {
//       if (item?.name === "createdAt" || item?.name === "folio") {
//         orderBy.push({ [item?.name]: item?.direction });
//       } else if (item.property) {
//         if (item.property.isDynamic) {
//           orderBy.push(getSortByHardCodedProperty(item.entity, item.name, item.direction));
//         } else {
//           orderBy.push(getSortByHardCodedProperty(filters, field.property, filters.query, field.condition));
//         }
//       }
//     });
//   }
// }

// function getSortByHardCodedProperty(entity: Entity, name: string, direction: string) {
//   return {
//       [entity.name]: {
//         [name]: direction,
//       },
//     };
// }

// function getSortByDynamicProperty(property: Property, value: string | null, condition: string | undefined) {
//   if (value === null) {
//     return {};
//   }
//   return {
//     values: {
//       some: {
//         propertyId: property.id,
//         textValue: {
//           [condition ?? "contains"]: value,
//         },
//       },
//     },
//   };
// }

// export default {
//   getRowSortCondition,
// };

import { Property } from "@prisma/client";
import { EntityWithDetails } from "../db/entities/entities.db.server";

function isPropertyVisible(property: Property) {
  return !property.isDetail && !["id"].includes(property.name);
}

function getDefaultEntityColumns(entity: EntityWithDetails) {
  return entity.properties
    .filter((f) => f.isDefault || (!f.isDefault && !f.isHidden))
    .map((item) => {
      return {
        name: item.name,
        title: item.title,
        visible: isPropertyVisible(item),
      };
    });
}

export default {
  isPropertyVisible,
  getDefaultEntityColumns,
};

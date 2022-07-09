import { Entity, Property } from "@prisma/client";
import { Params } from "react-router";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { getEntityByName, getEntityByOrder, getEntityByPrefix, getEntityBySlug } from "../db/entities/entities.db.server";

const getEntityFromParams = async (params: Params) => {
  return await getEntityBySlug(params.entity ?? "");
};

const validateEntity = async (name: string, slug: string, order: number | null, prefix: string, entity?: Entity) => {
  const errors: string[] = [];

  if (!entity || entity?.name !== name) {
    const existingName = await getEntityByName(name);
    if (existingName) {
      errors.push(`Existing entity with name '${name}': ${existingName.slug}`);
    }
  }

  if (!entity || entity?.slug !== slug) {
    const existingSlug = await getEntityBySlug(slug);
    if (existingSlug) {
      errors.push(`Existing entity with slug '${slug}': ${existingSlug.slug}`);
    }
  }

  if (order) {
    if (!entity || entity?.order !== order) {
      const existingOrder = await getEntityByOrder(order);
      if (existingOrder) {
        errors.push(`Existing entity with order '${order}':  ${existingOrder.slug}`);
      }
    }
  }

  if (!entity || entity?.prefix !== prefix) {
    const existingPrefix = await getEntityByPrefix(prefix);
    if (existingPrefix) {
      errors.push(`Existing entity with prefix '${prefix}': ${existingPrefix.slug}`);
    }
  }

  return errors;
};

const getFieldTitle = (field: Property, isDefault = false): string => {
  switch (field.type) {
    case PropertyType.USER:
    case PropertyType.ROLE:
    case PropertyType.ID:
      if (isDefault) {
        return "entities.defaultFields." + PropertyType[field.type];
      } else {
        return "entities.fields." + PropertyType[field.type];
      }
    default:
      return field.title;
  }
};

export default {
  validateEntity,
  getEntityFromParams,
  getFieldTitle,
};

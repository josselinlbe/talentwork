import { Entity, EntityProperty } from "@prisma/client";
import { Params } from "react-router";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import { getEntityByOrder, getEntityByPrefix, getEntityBySlug } from "../db/entities.db.server";

const getEntityFromParams = async (params: Params) => {
  return await getEntityBySlug(params.entity ?? "");
};

const validateEntity = async (name: string, slug: string, order: number, prefix: string, entity?: Entity) => {
  const errors: string[] = [];

  if (!entity || entity?.name !== name) {
    const existingName = await getEntityBySlug(name);
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

  if (!entity || entity?.order !== order) {
    const existingOrder = await getEntityByOrder(order);
    if (existingOrder) {
      errors.push(`Existing entity with order '${order}':  ${existingOrder.slug}`);
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

const getFieldTitle = (field: EntityProperty, isDefault = false): string => {
  switch (field.type) {
    case EntityPropertyType.USER:
    case EntityPropertyType.ROLE:
    case EntityPropertyType.ID:
      if (isDefault) {
        return "entities.defaultFields." + EntityPropertyType[field.type];
      } else {
        return "entities.fields." + EntityPropertyType[field.type];
      }
    case EntityPropertyType.TEXT:
    case EntityPropertyType.NUMBER:
    case EntityPropertyType.DATE:
    case EntityPropertyType.SELECT:
    case EntityPropertyType.FORMULA:
    case EntityPropertyType.MEDIA:
      return field.title;
    case EntityPropertyType.ENTITY:
      return field.title;
    default:
      return "";
  }
};

export default {
  validateEntity,
  getEntityFromParams,
  getFieldTitle,
};

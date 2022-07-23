import { EntityView } from "@prisma/client";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { getEntityViewByOrder, getEntityViewByName, getEntityViews, getEntityViewDefault } from "../db/entities/entityViews.db.server";

const getCurrentEntityView = async (entityId: string, request: Request) => {
  const params = new URL(request.url).searchParams;
  const name = params.get("v");
  if (name) {
    return await getEntityViewByName(entityId, name);
  } else {
    return await getEntityViewDefault(entityId);
  }
};

const validateEntityView = async (entityId: string, isDefault: boolean, name: string, title: string, order: number | null, entityView?: EntityView) => {
  const errors: string[] = [];

  const views = await getEntityViews(entityId);
  if (isDefault) {
    const defaultView = views.find((f) => f.id !== entityView?.id && f.isDefault);
    if (defaultView) {
      errors.push(`Existing default entity view with title: ${defaultView.title}`);
    }
  }

  if (!entityView || entityView?.name !== name) {
    const existingName = views.find((f) => f.id !== entityView?.id && f.name.toLowerCase() === name.toLowerCase());
    if (existingName) {
      errors.push(`Existing entity view with name: ${existingName.name}`);
    }
  }

  if (!entityView || entityView?.title !== title) {
    const existingTitle = views.find((f) => f.id !== entityView?.id && f.title.toLowerCase() === title.toLowerCase());
    if (existingTitle) {
      errors.push(`Existing entity view with title: ${existingTitle.title}`);
    }
  }

  if (order) {
    if (!entityView || entityView?.order !== order) {
      const existingOrder = await getEntityViewByOrder(entityId, order);
      if (existingOrder) {
        errors.push(`Existing entity view with order '${order}':  ${existingOrder.title}`);
      }
    }
  }

  return errors;
};

const validateGroupBy = async (entity: EntityWithDetails, layout: string, groupBy: string | undefined, groupByPropertyId: string | undefined) => {
  if (layout !== "board") {
    return [];
  }

  const errors: string[] = [];
  if (groupBy === "byWorkflowStates" && entity.workflowStates.length === 0) {
    errors.push(`Cannot save a Board view without workflow states`);
  } else if (groupBy === "byProperty") {
    const property = entity.properties.find((p) => p.id === groupByPropertyId);
    if (!property || property.type !== PropertyType.SELECT) {
      errors.push(`Cannot save a Board view without a SELECT property`);
    }
  }

  return errors;
};

export default {
  getCurrentEntityView,
  validateEntityView,
  validateGroupBy,
};

import { EntityView, EntityViewFilter, EntityViewProperty, EntityViewSort, Property } from "@prisma/client";
import { db } from "~/utils/db.server";

export type EntityViewWithDetails = EntityView & {
  properties: EntityViewProperty[];
  filters: EntityViewFilter[];
  sort: EntityViewSort[];
  groupByProperty: Property | null;
};

const include = {
  properties: true,
  filters: true,
  sort: true,
  groupByProperty: true,
};

export async function getEntityViews(entityId: string): Promise<EntityViewWithDetails[]> {
  return await db.entityView.findMany({
    where: {
      entityId,
    },
    include,
  });
}

export async function getEntityView(id: string): Promise<EntityViewWithDetails | null> {
  return await db.entityView.findUnique({
    where: {
      id,
    },
    include,
  });
}

export async function getEntityViewByName(entityId: string, name: string): Promise<EntityViewWithDetails | null> {
  return await db.entityView.findFirst({
    where: {
      entityId,
      name,
    },
    include,
  });
}

export async function getEntityViewDefault(entityId: string): Promise<EntityViewWithDetails | null> {
  return await db.entityView.findFirst({
    where: {
      entityId,
      isDefault: true,
    },
    include,
  });
}

export async function getEntityViewByOrder(entityId: string, order: number): Promise<EntityViewWithDetails | null> {
  return await db.entityView.findFirst({
    where: {
      entityId,
      order,
    },
    include,
  });
}

export default async function getMaxEntityViewOrder(entityId: string): Promise<number> {
  return (
    (
      await db.entityView.aggregate({
        where: { entityId },
        _max: {
          order: true,
        },
      })
    )._max?.order ?? 0
  );
}

export async function createEntityView(data: {
  entityId: string;
  layout: string;
  name: string;
  title: string;
  isDefault: boolean;
  pageSize: number;
  groupByWorkflowStates?: boolean;
  groupByPropertyId?: string | null;
  columns: number;
}) {
  const order = (await getMaxEntityViewOrder(data.entityId)) + 1;
  return await db.entityView.create({
    data: {
      entityId: data.entityId,
      layout: data.layout,
      order: order,
      name: data.name,
      title: data.title,
      isDefault: data.isDefault,
      pageSize: data.pageSize,
      groupByWorkflowStates: data.groupByWorkflowStates,
      groupByPropertyId: data.groupByPropertyId,
    },
  });
}

export async function updateEntityViewProperties(id: string, items: { propertyId: string; order: number }[]) {
  await db.entityViewProperty.deleteMany({
    where: { entityViewId: id },
  });
  return await Promise.all(
    items.map(async (item) => {
      return await db.entityViewProperty.create({
        data: {
          entityViewId: id,
          propertyId: item.propertyId,
          order: item.order,
        },
      });
    })
  );
}

export async function updateEntityViewFilters(id: string, items: { name: string; condition: string; value: string }[]) {
  await db.entityViewFilter.deleteMany({
    where: { entityViewId: id },
  });
  return await Promise.all(
    items.map(async (item) => {
      return await db.entityViewFilter.create({
        data: {
          entityViewId: id,
          name: item.name,
          condition: item.condition,
          value: item.value,
        },
      });
    })
  );
}

export async function updateEntityViewSort(id: string, items: { name: string; asc: boolean; order: number }[]) {
  await db.entityViewSort.deleteMany({
    where: { entityViewId: id },
  });
  return await Promise.all(
    items.map(async (item) => {
      return await db.entityViewSort.create({
        data: {
          entityViewId: id,
          name: item.name,
          asc: item.asc,
          order: item.order,
        },
      });
    })
  );
}

export async function updateEntityView(
  id: string,
  data: {
    layout?: string;
    isDefault?: boolean;
    pageSize?: number;
    name?: string;
    title?: string;
    order?: number;
    groupByWorkflowStates?: boolean;
    groupByPropertyId?: string | null;
    columns?: number | null;
  }
) {
  return await db.entityView.update({
    where: { id },
    data,
  });
}

export async function deleteEntityView(id: string) {
  return await db.entityView.delete({
    where: { id },
  });
}

import { Entity, EntityWorkflowState, Property, PropertyAttributes, PropertyOption } from "@prisma/client";
import Constants from "~/application/Constants";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { Visibility } from "~/application/dtos/shared/Visibility";
import { Colors } from "~/application/enums/shared/Colors";
import { defaultProperties } from "~/utils/helpers/PropertyHelper";
import { createCustomEntityWorkflowStates, createDefaultEntityWorkflow } from "~/utils/services/WorkflowService";
import { db } from "../../db.server";
import { createProperties, CreatePropertyDto } from "./properties.db.server";

export type RowsUsage = { entityId: string; _count: number };
export type EntityWithDetails = Entity & {
  properties: PropertyWithDetails[];
  workflowStates: EntityWorkflowState[];
};
export type EntityWithCount = EntityWithDetails & { _count: { rows: number } };

export type PropertyWithDetails = Property & {
  // entity: EntityWithDetails;
  attributes: PropertyAttributes | null;
  options: PropertyOption[];
  parent?: PropertyWithDetails;
};

// const includePropertiesWithDetails = {
//   properties: {
//     include: {
//       options: true
//     },
//   },
// };

export async function getAllEntities(active?: boolean, isDefault?: boolean): Promise<EntityWithDetails[]> {
  let where = {};
  if (active) {
    where = {
      active,
      isDefault,
    };
  }
  return await db.entity.findMany({
    where,
    orderBy: [
      { isDefault: "desc" },
      {
        order: "asc",
      },
    ],
    include: {
      workflowStates: true,
      properties: {
        orderBy: { order: "asc" },
        include: {
          attributes: true,
          // entity: {
          //   include: {
          //     ...includePropertiesWithDetails,
          //   },
          // },
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
}

export async function getAllEntitiesWithRowCount(): Promise<EntityWithCount[]> {
  return await db.entity.findMany({
    include: {
      workflowStates: true,
      _count: {
        select: {
          rows: true,
        },
      },
      properties: {
        orderBy: { order: "asc" },
        include: {
          // entity: {
          //   include: {
          //     ...includePropertiesWithDetails,
          //   },
          // },
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
    orderBy: [
      { isDefault: "desc" },
      {
        order: "asc",
      },
    ],
  });
}

export async function getAllRowsUsage(tenantId: string): Promise<RowsUsage[]> {
  const countEntities = await db.row.groupBy({
    by: ["entityId"],
    _count: true,
    where: {
      OR: [
        {
          tenantId,
        },
        {
          linkedAccount: {
            OR: [
              {
                providerTenantId: tenantId,
              },
              {
                clientTenantId: tenantId,
              },
            ],
          },
        },
      ],
    },
  });
  return countEntities;
}

// export async function getRowsCount(tenantId: string, entityId: string): Promise<number> {
//   const whereTenant = {
//     OR: [
//       {
//         tenantId,
//       },
//       {
//         linkedAccount: {
//           OR: [
//             {
//               providerTenantId: tenantId,
//             },
//             {
//               clientTenantId: tenantId,
//             },
//           ],
//         },
//       },
//     ],
//   };
//   if (!entityLimit || entityLimit.type === EntityLimitType.MAX) {
//     return await db.row.count({
//       where: {
//         entityId,
//         ...whereTenant,
//       },
//     });
//   } else {
//     return await db.row.count({
//       where: {
//         entityId: entityLimit.entityId,
//         ...whereTenant,
//         // TODO: CURRENT MONTH
//       },
//     });
//   }
// }

export async function getEntityById(id: string): Promise<EntityWithDetails | null> {
  return await db.entity.findUnique({
    where: {
      id,
    },
    include: {
      workflowStates: true,
      properties: {
        orderBy: { order: "asc" },
        include: {
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
}

export async function getEntityBySlug(slug: string): Promise<EntityWithDetails | null> {
  return await db.entity.findFirst({
    where: {
      slug,
    },
    include: {
      workflowStates: true,
      properties: {
        orderBy: { order: "asc" },
        include: {
          attributes: true,
          // entity: {
          //   include: {
          //     ...includePropertiesWithDetails,
          //   },
          // },
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
}

export async function getEntityByName(name: string): Promise<EntityWithDetails | null> {
  return await db.entity.findFirst({
    where: {
      name,
    },
    include: {
      workflowStates: true,
      properties: {
        orderBy: { order: "asc" },
        include: {
          // entity: {
          //   include: {
          //     ...includePropertiesWithDetails,
          //   },
          // },
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
}

export async function getEntityByOrder(order: number): Promise<Entity | null> {
  return await db.entity.findFirst({
    where: {
      order,
    },
  });
}

export async function getEntityByPrefix(prefix: string): Promise<Entity | null> {
  return await db.entity.findFirst({
    where: {
      prefix,
    },
  });
}

export async function createEntity(
  data: {
    name: string;
    slug: string;
    prefix: string;
    title: string;
    titlePlural: string;
    isFeature: boolean;
    isAutogenerated: boolean;
    isDefault: boolean;
    hasApi: boolean;
    requiresLinkedAccounts: boolean;
    icon: string;
    active: boolean;
    hasTags: boolean;
    hasComments: boolean;
    hasTasks: boolean;
    hasWorkflow: boolean;
    defaultVisibility: string;
  },
  workflowStates?: { name: string; title: string; color: Colors }[] | null
) {
  const order = (await getMaxEntityOrder()) + 1;
  const entity = await db.entity.create({
    data: {
      ...data,
      order,
    },
  });

  const webhooks = [
    {
      action: DefaultLogActions.Created,
      method: "POST",
      endpoint: "",
    },
    {
      action: DefaultLogActions.Updated,
      method: "POST",
      endpoint: "",
    },
    {
      action: DefaultLogActions.Created,
      method: "POST",
      endpoint: "",
    },
  ];

  await Promise.all(
    webhooks.map(async (webhook) => {
      return await db.entityWebhook.create({
        data: {
          entityId: entity.id,
          action: webhook.action,
          method: webhook.method,
          endpoint: webhook.endpoint,
        },
      });
    })
  );

  await Promise.all(
    defaultProperties.map(async (property) => {
      return await db.property.create({
        data: {
          entityId: entity.id,
          ...property,
        },
      });
    })
  );

  if (entity.hasWorkflow) {
    if (workflowStates !== undefined) {
      await createCustomEntityWorkflowStates(entity.id, workflowStates);
    } else {
      await createDefaultEntityWorkflow(entity.id);
    }
  }

  return entity;
}

export async function createCoreEntity(
  data: {
    name: string;
    slug: string;
    title: string;
    titlePlural: string;
    prefix: string;
    isFeature?: boolean;
    isAutogenerated?: boolean;
    isDefault?: boolean;
    hasApi?: boolean;
    requiresLinkedAccounts?: boolean;
    icon?: string;
    active?: boolean;
    hasTags?: boolean;
    hasComments?: boolean;
    hasTasks?: boolean;
    hasWorkflow?: boolean;
    defaultVisibility?: Visibility;
  },
  properties?: CreatePropertyDto[],
  workflowStates?: { name: string; title: string; color: Colors }[] | null
) {
  const entity = await createEntity(
    {
      name: data.name,
      slug: data.slug,
      prefix: data.prefix,
      title: data.title,
      titlePlural: data.titlePlural,
      isFeature: data.isFeature ?? true,
      isAutogenerated: data.isAutogenerated ?? true,
      isDefault: data.isDefault ?? false,
      hasApi: data.hasApi ?? true,
      requiresLinkedAccounts: data.requiresLinkedAccounts ?? false,
      icon: data.icon ?? "",
      active: data.active ?? true,
      hasTags: data.hasTags ?? true,
      hasComments: data.hasComments ?? true,
      hasTasks: data.hasTasks ?? true,
      hasWorkflow: data.hasTasks ?? false,
      defaultVisibility: data.defaultVisibility ?? Constants.DEFAULT_ROW_VISIBILITY,
    },
    workflowStates
  );
  if (properties) {
    await createProperties(entity.id, properties);
  }
  return entity;
}

export async function updateEntity(
  id: string,
  data: {
    name: string;
    slug: string;
    order: number;
    prefix: string;
    title: string;
    titlePlural: string;
    isFeature: boolean;
    isAutogenerated: boolean;
    isDefault: boolean;
    hasApi: boolean;
    requiresLinkedAccounts: boolean;
    icon: string;
    active: boolean;
    hasTags: boolean;
    hasComments: boolean;
    hasTasks: boolean;
    hasWorkflow: boolean;
    defaultVisibility: string;
  }
) {
  return await db.entity.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteEntity(id: string) {
  return await db.entity.delete({
    where: {
      id,
    },
  });
}

export default async function getMaxEntityOrder(): Promise<number> {
  return (
    (
      await db.entity.aggregate({
        _max: {
          order: true,
        },
      })
    )._max?.order ?? 0
  );
}

export async function getDefaultEntityVisibility(id: string): Promise<string | null> {
  return (
    (
      await db.entity.findFirst({
        where: { id },
        select: {
          defaultVisibility: true,
        },
      })
    )?.defaultVisibility ?? Constants.DEFAULT_ROW_VISIBILITY
  );
}

import { Tenant, User, Log, ApiKey } from "@prisma/client";
import { getClientIPAddress } from "remix-utils";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { db } from "../db.server";
import ApiHelper from "../helpers/ApiHelper";
import RowFiltersHelper from "../helpers/RowFiltersHelper";
import RowHelper from "../helpers/RowHelper";
import { TenantUrl } from "../services/urlService";
import { getUserInfo } from "../session.server";
import { EntityWithDetails } from "./entities/entities.db.server";
import { callEntityWebhooks } from "./entities/entityWebhooks.db.server";
import { RowCommentWithDetails } from "./entities/rowComments.db.server";
import { RowWithDetails } from "./entities/rows.db.server";
import { includeCreatedBy, includeSimpleCreatedByUser } from "./users.db.server";
import { RowWorkflowTransitionWithDetails } from "./workflows/rowWorkflowTransitions.db.server";

export type LogWithDetails = Log & {
  user: User | null;
  apiKey: ApiKey | null;
  tenant?: Tenant | null;
  comment?: RowCommentWithDetails | null;
  workflowTransition?: RowWorkflowTransitionWithDetails | null;
};

const include = {
  user: true,
  tenant: true,
  apiKey: true,
  comment: {
    include: {
      ...includeSimpleCreatedByUser,
      reactions: {
        include: {
          ...includeSimpleCreatedByUser,
        },
      },
    },
  },
  workflowTransition: {
    include: {
      ...includeCreatedBy,
      workflowStep: {
        include: {
          fromState: true,
          toState: true,
        },
      },
    },
  },
};

export async function getAllLogs(
  pagination: { page: number; pageSize: number },
  filters: FiltersDto
): Promise<{ items: LogWithDetails[]; pagination: PaginationDto }> {
  const where = RowFiltersHelper.getFiltersCondition(filters);
  const items = await db.log.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    include,
    where,
  });
  const totalItems = await db.log.count({
    where,
  });

  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

export async function getLogs(tenantId: string): Promise<LogWithDetails[]> {
  return await db.log.findMany({
    where: {
      tenantId,
    },
    include,
  });
}

export async function getAllRowLogs(entityId: string): Promise<LogWithDetails[]> {
  return await db.log.findMany({
    where: {
      row: {
        entityId,
      },
    },
    include,
  });
}

export async function getRowLogs(tenantId: string | null, rowId: string): Promise<LogWithDetails[]> {
  return await db.log.findMany({
    where: {
      tenantId,
      rowId,
    },
    include,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createLog(request: Request, tenantUrl: TenantUrl, action: string, details: string) {
  const userInfo = await getUserInfo(request);
  await db.log.create({
    data: {
      tenantId: tenantUrl.tenantId,
      userId: userInfo.userId,
      url: new URL(request.url).pathname,
      action,
      details,
    },
  });
}

export async function createManualLog(userId: string, tenantId: string | null, pathname: string, action: string, details: string) {
  await db.log.create({
    data: {
      tenantId,
      userId,
      url: pathname,
      action,
      details,
    },
  });
}

export async function createRowLog(
  request: Request,
  data: {
    tenantId: string | null;
    createdByUserId?: string | null;
    createdByApiKey?: string | null;
    action: string;
    entity: EntityWithDetails;
    item: RowWithDetails | null;
    commentId?: string | null;
    details?: string;
  }
) {
  const log = await db.log.create({
    data: {
      tenantId: data.tenantId,
      userId: data.createdByUserId ?? null,
      apiKeyId: data.createdByApiKey ?? null,
      url: new URL(request.url).pathname,
      rowId: data.item?.id ?? null,
      action: data.action,
      details:
        data.details ??
        (data.item !== null
          ? JSON.stringify({
              ...RowHelper.getProperties(data.entity, data.item),
              id: data.item.id,
            })
          : null),
      commentId: data.commentId ?? null,
    },
  });
  const apiFormat = ApiHelper.getApiFormat(data.entity, data.item);
  await callEntityWebhooks(log.id, data.entity.id, data.action, apiFormat);
  return log;
}

export async function createManualRowLog(
  data: {
    tenantId: string | null;
    createdByUserId?: string | null;
    createdByApiKey?: string | null;
    action: string;
    entity: EntityWithDetails;
    item: RowWithDetails | null;
    workflowTransition?: RowWorkflowTransitionWithDetails | null;
  },
  request?: Request
) {
  let details =
    data.item !== null
      ? JSON.stringify({
          ...RowHelper.getProperties(data.entity, data.item),
          id: data.item,
        })
      : null;
  if (data.workflowTransition) {
    details = `From ${data.workflowTransition.workflowStep.fromState.title} to ${data.workflowTransition.workflowStep.toState.title}`;
  }
  const log = await db.log.create({
    data: {
      tenantId: data.tenantId,
      userId: data.createdByUserId ?? null,
      apiKeyId: data.createdByApiKey ?? null,
      url: request ? new URL(request.url).pathname : "",
      rowId: data.item?.id ?? null,
      action: data.action,
      details,
      workflowTransitionId: data.workflowTransition?.id ?? null,
    },
  });
  const apiFormat = ApiHelper.getApiFormat(data.entity, data.item);
  await callEntityWebhooks(log.id, data.entity.id, data.action, apiFormat);
  return log;
}

export async function createLogLogin(request: Request, user: User) {
  // eslint-disable-next-line no-console
  console.log({ clientIpAddress: getClientIPAddress(request.headers) });
  // jitsu
  //   .id({
  //     email: user.email,
  //     internal_id: user.id,
  //   })
  //   .catch(() => {
  //     // console.error(error);
  //   });

  await db.log.create({
    data: {
      userId: user.id,
      url: "",
      action: DefaultLogActions.Login,
      details: "",
    },
  });
}

export async function createLogLogout(request: Request, userId: string) {
  // jitsu
  //   .id({
  //     email: "",
  //     internal_id: "",
  //   })
  //   .catch(() => {
  //     // console.error(error);
  //   });
  await db.log.create({
    data: {
      userId,
      url: "",
      action: "Login",
      details: "",
    },
  });
}

export async function createAdminLog(request: Request, action: string, details: string) {
  const userInfo = await getUserInfo(request);
  await db.log.create({
    data: {
      userId: userInfo.userId,
      url: new URL(request.url).pathname,
      action,
      details,
    },
  });
}

import { EntityWebhook } from "@prisma/client";
import { db } from "../db.server";

export type EntityWebhookWithDetails = EntityWebhook & { _count: { logs: number } };
export async function getEntityWebhooks(entityId: string) {
  return await db.entityWebhook.findMany({
    where: {
      entityId,
    },
    include: {
      _count: {
        select: {
          logs: true,
        },
      },
    },
  });
}

export async function getEntityWebhook(id: string) {
  return await db.entityWebhook.findUnique({
    where: {
      id,
    },
  });
}

export async function getEntityWebhooksByAction(entityId: string, action: string) {
  return await db.entityWebhook.findMany({
    where: {
      entityId,
      action,
    },
  });
}

export async function createEntityWebhook(data: { entityId: string; action: string; method: string; endpoint: string }) {
  return await db.entityWebhook.create({
    data,
  });
}

export async function updateEntityWebhook(
  id: string,
  data: {
    action: string;
    method: string;
    endpoint: string;
  }
) {
  return await db.entityWebhook.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteEntityWebhook(id: string) {
  return await db.entityWebhook.delete({
    where: {
      id,
    },
  });
}

export async function callEntityWebhooks(logId: string, entityId: string, action: string, body: string) {
  const webhooks = await getEntityWebhooksByAction(entityId, action);
  return await Promise.all(
    webhooks.map(async (webhook) => {
      if (webhook.endpoint) {
        const response = await fetch(webhook.endpoint, {
          method: webhook.method,
          body,
        });
        console.log({ response });
        return db.entityWebhookLog.create({
          data: {
            webhookId: webhook.id,
            logId,
            status: response.status,
          },
        });
      }
    })
  );
}

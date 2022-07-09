import { LinkedAccount, Tenant, TenantUser, Row } from "@prisma/client";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { db } from "../db.server";
import { includeSimpleCreatedByUser, includeSimpleUser, UserSimple } from "./users.db.server";

export type LinkedAccountWithDetails = LinkedAccount & {
  createdByUser: UserSimple;
  createdByTenant: Tenant;
  providerTenant: Tenant;
  clientTenant: Tenant;
};

export type LinkedAccountWithDetailsAndContracts = LinkedAccountWithDetails & {
  rows: Row[];
};

export type LinkedAccountWithDetailsAndMembers = LinkedAccount & {
  providerTenant: Tenant & { users: (TenantUser & { tenant: Tenant; user: UserSimple })[] };
  clientTenant: Tenant & { users: (TenantUser & { tenant: Tenant; user: UserSimple })[] };
};

export async function getLinkedAccount(id?: string): Promise<LinkedAccountWithDetailsAndContracts | null> {
  if (!id) {
    return null;
  }
  return await db.linkedAccount.findUnique({
    where: {
      id,
    },
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
      rows: true,
      ...includeSimpleCreatedByUser,
    },
  });
}

export async function getLinkedAccountByTenantIds(providerTenantId: string, clientTenantId: string) {
  return await db.linkedAccount.findFirst({
    where: {
      providerTenantId,
      clientTenantId,
    },
  });
}

export async function getLinkedAccountsCount(tenantId: string, statusIn: LinkedAccountStatus[]): Promise<number> {
  return await db.linkedAccount.count({
    where: {
      status: {
        in: statusIn,
      },
      OR: [
        {
          providerTenantId: tenantId,
        },
        {
          clientTenantId: tenantId,
        },
      ],
    },
  });
}

export async function getLinkedAccounts(tenantId: string, status?: LinkedAccountStatus): Promise<LinkedAccountWithDetails[]> {
  return await db.linkedAccount.findMany({
    where: {
      status,
      OR: [
        {
          providerTenantId: tenantId,
        },
        {
          clientTenantId: tenantId,
        },
      ],
    },
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
      ...includeSimpleCreatedByUser,
    },
  });
}

export async function getClientLinksCount(tenantId: string) {
  return await db.linkedAccount.count({
    where: {
      status: LinkedAccountStatus.LINKED,
      providerTenantId: tenantId,
    },
  });
}

export async function getClientLinks(tenantId: string): Promise<LinkedAccountWithDetailsAndContracts[]> {
  return await db.linkedAccount.findMany({
    where: {
      status: LinkedAccountStatus.LINKED,
      providerTenantId: tenantId,
    },
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
      ...includeSimpleCreatedByUser,
      rows: true,
    },
  });
}

export async function getProviderLinksCount(tenantId: string) {
  return await db.linkedAccount.count({
    where: {
      status: LinkedAccountStatus.LINKED,
      clientTenantId: tenantId,
    },
  });
}

export async function getProviderLinks(tenantId: string): Promise<LinkedAccountWithDetailsAndContracts[]> {
  return await db.linkedAccount.findMany({
    where: {
      status: LinkedAccountStatus.LINKED,
      clientTenantId: tenantId,
    },
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
      ...includeSimpleCreatedByUser,
      rows: true,
    },
  });
}

export async function getLinksWithMembers(tenantId: string | null): Promise<LinkedAccountWithDetailsAndMembers[]> {
  if (!tenantId) {
    return [];
  }
  return await db.linkedAccount.findMany({
    where: {
      status: LinkedAccountStatus.LINKED,
      OR: [
        {
          providerTenantId: tenantId,
        },
        {
          clientTenantId: tenantId,
        },
      ],
    },
    include: {
      providerTenant: {
        include: {
          users: {
            include: {
              ...includeSimpleUser,
              tenant: true,
            },
          },
        },
      },
      clientTenant: {
        include: {
          users: {
            include: {
              ...includeSimpleUser,
              tenant: true,
            },
          },
        },
      },
    },
  });
}

export async function createLinkedAccount(data: {
  createdByUserId: string;
  createdByTenantId: string;
  providerTenantId: string;
  clientTenantId: string;
  status: LinkedAccountStatus;
}) {
  return await db.linkedAccount.create({
    data,
  });
}

export async function updateLinkedAccount(id: string, data: { status: LinkedAccountStatus }) {
  return await db.linkedAccount.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteLinkedAccount(id: string) {
  return await db.linkedAccount.delete({
    where: {
      id,
    },
  });
}

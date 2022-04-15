import { Contract, TenantRelationship, Tenant, TenantUser, User } from "@prisma/client";
import { TenantRelationshipStatus } from "~/application/enums/tenants/TenantRelationshipStatus";
import { db } from "../db.server";

export type TenantRelationshipWithDetails = TenantRelationship & {
  createdByUser: User;
  createdByTenant: Tenant;
  providerTenant: Tenant;
  clientTenant: Tenant;
};

export type TenantRelationshipWithDetailsAndContracts = TenantRelationshipWithDetails & {
  contracts: Contract[];
};

export type TenantRelationshipWithDetailsAndMembers = TenantRelationship & {
  providerTenant: Tenant & { users: (TenantUser & { tenant: Tenant; user: User })[] };
  clientTenant: Tenant & { users: (TenantUser & { tenant: Tenant; user: User })[] };
};

export async function getTenantRelationship(id?: string): Promise<TenantRelationshipWithDetailsAndContracts | null> {
  if (!id) {
    return null;
  }
  return await db.tenantRelationship.findUnique({
    where: {
      id,
    },
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
      contracts: true,
      createdByUser: true,
    },
  });
}

export async function getTenantRelationshipByTenantIds(providerTenantId: string, clientTenantId: string) {
  return await db.tenantRelationship.findFirst({
    where: {
      providerTenantId,
      clientTenantId,
    },
  });
}

export async function getTenantRelationshipsCount(tenantId: string, statusIn: TenantRelationshipStatus[]): Promise<number> {
  return await db.tenantRelationship.count({
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

export async function getTenantRelationships(tenantId: string, status?: TenantRelationshipStatus): Promise<TenantRelationshipWithDetails[]> {
  return await db.tenantRelationship.findMany({
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
      createdByUser: true,
    },
  });
}

export async function getClientLinksCount(tenantId: string) {
  return await db.tenantRelationship.count({
    where: {
      status: TenantRelationshipStatus.LINKED,
      providerTenantId: tenantId,
    },
  });
}

export async function getClientLinks(tenantId: string): Promise<TenantRelationshipWithDetailsAndContracts[]> {
  return await db.tenantRelationship.findMany({
    where: {
      status: TenantRelationshipStatus.LINKED,
      providerTenantId: tenantId,
    },
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
      createdByUser: true,
      contracts: true,
    },
  });
}

export async function getProviderLinksCount(tenantId: string) {
  return await db.tenantRelationship.count({
    where: {
      status: TenantRelationshipStatus.LINKED,
      clientTenantId: tenantId,
    },
  });
}

export async function getProviderLinks(tenantId: string): Promise<TenantRelationshipWithDetailsAndContracts[]> {
  return await db.tenantRelationship.findMany({
    where: {
      status: TenantRelationshipStatus.LINKED,
      clientTenantId: tenantId,
    },
    include: {
      createdByTenant: true,
      providerTenant: true,
      clientTenant: true,
      createdByUser: true,
      contracts: true,
    },
  });
}

export async function getLinksWithMembers(tenantId: string): Promise<TenantRelationshipWithDetailsAndMembers[]> {
  return await db.tenantRelationship.findMany({
    where: {
      status: TenantRelationshipStatus.LINKED,
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
              user: true,
              tenant: true,
            },
          },
        },
      },
      clientTenant: {
        include: {
          users: {
            include: {
              user: true,
              tenant: true,
            },
          },
        },
      },
    },
  });
}

export async function createTenantRelationship(data: {
  createdByUserId: string;
  createdByTenantId: string;
  providerTenantId: string;
  clientTenantId: string;
  status: TenantRelationshipStatus;
  userInvitedId: string;
}) {
  return await db.tenantRelationship.create({
    data,
  });
}

export async function updateTenantRelationship(id: string, data: { status: TenantRelationshipStatus }) {
  return await db.tenantRelationship.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteTenantRelationship(id: string) {
  return await db.tenantRelationship.delete({
    where: {
      id,
    },
  });
}

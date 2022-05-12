import { ContractStatusFilter } from "~/modules/contracts/enums/ContractStatusFilter";
import { ContractActivityType } from "~/modules/contracts/enums/ContractActivityType";
import { db } from "../../../utils/db.server";
import { Contract, ContractMember, User, ContractEmployee, Employee, ContractActivity } from "@prisma/client";
import { ContractMemberRole } from "../enums/ContractMemberRole";
import { ContractStatus } from "../enums/ContractStatus";
import { includeEntityRowDetails } from "~/utils/db/entityRows.db.server";

export type ContractWithDetails = Contract & {
  entityRow: EntityRowWithDetails;
  members: (ContractMember & { user: User })[];
  employees: (ContractEmployee & { employee: Employee })[];
  activity: (ContractActivity & { createdByUser: User })[];
};

export async function getMonthlyContractsCount(tenantId: string) {
  var date = new Date();
  var firstDayCurrentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDayCurrentMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return await db.contract.count({
    where: {
      entityRow: {
        createdAt: {
          gte: firstDayCurrentMonth,
          lt: lastDayCurrentMonth,
        },
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
    },
  });
}

export async function getContract(id?: string): Promise<ContractWithDetails | null> {
  if (!id) {
    return null;
  }
  return await db.contract.findUnique({
    where: {
      id,
    },
    include: {
      entityRow: {
        include: {
          ...includeEntityRowDetails,
        },
      },
      members: {
        include: {
          user: true,
        },
      },
      employees: {
        include: {
          employee: true,
        },
      },
      activity: {
        include: {
          createdByUser: true,
        },
      },
    },
  });
}

export async function getContracts(tenantId: string, filter: ContractStatusFilter) {
  const include = {
    entityRow: {
      include: {
        linkedAccount: {
          include: {
            providerTenant: true,
            clientTenant: true,
          },
        },
        createdByUser: true,
      },
    },
  };
  if (filter === ContractStatusFilter.ALL) {
    return await db.contract.findMany({
      where: {
        entityRow: {
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
      },
      include,
    });
  }
  return await db.contract.findMany({
    where: {
      status: filter,
      entityRow: {
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
    },
    include,
  });
}

export async function createContract(
  entityId: string,
  createdByUserId: string,
  tenantId: string,
  linkedAccountId: string,
  data: {
    name: string;
    description: string;
    file: string;
    status: ContractStatus;
  },
  members: { userId: string; role: ContractMemberRole }[],
  employees: Employee[]
) {
  const item = await db.contract.create({
    data: {
      entityRow: {
        create: {
          entityId,
          createdByUserId,
          tenantId,
          linkedAccountId,
        },
      },
      ...data,
    },
  });

  if (item) {
    members.forEach(async (member) => {
      return await db.contractMember.create({
        data: {
          contractId: item.id,
          role: member.role,
          userId: member.userId,
        },
      });
    });

    employees.forEach(async (employee) => {
      return await db.contractEmployee.create({
        data: {
          contractId: item.id,
          employeeId: employee.id,
        },
      });
    });

    await db.contractActivity.create({
      data: {
        createdByUserId,
        contractId: item.id,
        type: ContractActivityType.CREATED,
      },
    });
  }

  return item;
}

export async function updateContract(
  id: string,
  userId: string,
  data: {
    name: string;
    description: string;
    file: string;
    status: ContractStatus;
  }
) {
  const item = await db.contract.update({
    where: {
      id,
    },
    data,
  });

  if (item) {
    await db.contractActivity.create({
      data: {
        createdByUserId: userId,
        contractId: item.id,
        type: ContractActivityType.UPDATED,
      },
    });
  }

  return item;
}

export async function deleteContract(id: string) {
  return await db.contract.delete({
    where: { id },
  });
}

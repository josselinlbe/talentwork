import { ContractStatusFilter } from "~/modules/contracts/enums/ContractStatusFilter";
import { ContractActivityType } from "~/modules/contracts/enums/ContractActivityType";
import { db } from "../../../utils/db.server";
import { Contract, ContractMember, ContractEmployee, ContractActivity } from "@prisma/client";
import { ContractMemberRole } from "../enums/ContractMemberRole";
import { ContractStatus } from "../enums/ContractStatus";
import { includeRowDetails, RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { createNewRowWithEntity } from "~/utils/services/rowsService";
import { includeSimpleCreatedByUser, includeSimpleUser, UserSimple } from "~/utils/db/users.db.server";

export type ContractWithDetails = Contract & {
  row: RowWithDetails;
  members: (ContractMember & { user: UserSimple })[];
  employees: (ContractEmployee & { row: RowWithDetails })[];
  activity: (ContractActivity & { createdByUser: UserSimple })[];
};

export async function getMonthlyContractsCount(tenantId: string) {
  var date = new Date();
  var firstDayCurrentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDayCurrentMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return await db.contract.count({
    where: {
      row: {
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
      row: {
        include: {
          ...includeRowDetails,
        },
      },
      members: {
        include: {
          ...includeSimpleUser,
        },
      },
      employees: {
        include: {
          row: {
            include: {
              ...includeRowDetails,
            },
          },
        },
      },
      activity: {
        include: {
          ...includeSimpleCreatedByUser,
        },
      },
    },
  });
}

export async function getContracts(tenantId: string, filter: ContractStatusFilter) {
  const include = {
    row: {
      include: {
        linkedAccount: {
          include: {
            providerTenant: true,
            clientTenant: true,
          },
        },
        ...includeSimpleCreatedByUser,
      },
    },
  };
  if (filter === ContractStatusFilter.ALL) {
    return await db.contract.findMany({
      where: {
        row: {
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
      row: {
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
  employees: RowWithDetails[]
) {
  // let folio = 1;
  // const maxFolio = await getMaxRowFolio(tenantId, entityId, undefined);
  // if (maxFolio && maxFolio._max.folio !== null) {
  //   folio = maxFolio._max.folio + 1;
  // }
  const row = await createNewRowWithEntity("contract", createdByUserId, linkedAccountId, tenantId);
  const item = await db.contract.create({
    data: {
      rowId: row.id,
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
          rowId: employee.id,
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

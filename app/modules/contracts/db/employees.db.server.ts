import { Employee } from "@prisma/client";
import { db } from "~/utils/db.server";
import { EntityRowWithDetails } from "~/utils/db/entityRows.db.server";

export type EmployeeWithCreatedByUser = Employee & {
  entityRow: EntityRowWithDetails;
};

export async function getEmployee(id?: string): Promise<EmployeeWithCreatedByUser | null> {
  if (!id) {
    return null;
  }
  return await db.employee.findUnique({
    where: {
      id,
    },
    include: {
      entityRow: {
        include: {
          ...includeEntityRowDetails,
        },
      },
    },
  });
}

export async function getEmployeeByEmail(tenantId: string, email: string) {
  return await db.employee.findFirst({
    where: {
      entityRow: {
        tenantId,
      },
      email,
    },
  });
}

export async function getEmployeesCount(tenantId: string) {
  return await db.employee.count({
    where: {
      entityRow: {
        tenantId,
      },
    },
  });
}

export async function getEmployees(tenantId: string) {
  return await db.employee.findMany({
    where: {
      entityRow: {
        tenantId,
      },
    },
  });
}

export async function createEmployee(
  entityId: string,
  createdByUserId: string,
  tenantId: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
  }
) {
  return await db.employee.create({
    data: {
      entityRow: {
        create: {
          entityId,
          createdByUserId,
          tenantId,
        },
      },
      ...data,
    },
  });
}

export async function updateEmployee(
  id: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
  }
) {
  return await db.employee.update({
    where: { id },
    data,
  });
}

export async function deleteEmployee(id: string) {
  return await db.employee.delete({
    where: { id },
  });
}

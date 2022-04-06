import { createEmployee } from "../db/employees.db.server";

export async function createEmployees(
  userId: string,
  tenantId: string,
  workspaceId: string,
  employees: { email: string; firstName: string; lastName: string }[]
) {
  employees.forEach(async (employee) => {
    const newEmployee = {
      createdByUserId: userId,
      tenantId: tenantId,
      workspaceId: workspaceId,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
    };
    await createEmployee(newEmployee);
  });
}

import { createEmployee } from "../db/employees.db.server";

export async function createEmployees(
  userInfo: { userId: any; currentTenantId: any; currentWorkspaceId: any },
  employees: { email: string; firstName: string; lastName: string }[]
) {
  employees.forEach(async (employee) => {
    const newEmployee = {
      createdByUserId: userInfo.userId,
      tenantId: userInfo.currentTenantId,
      workspaceId: userInfo.currentWorkspaceId,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
    };
    await createEmployee(newEmployee);
  });
}

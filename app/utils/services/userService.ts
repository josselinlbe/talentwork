import { getMyTenants, getTenantWithUsers } from "../db/tenants.db.server";
import { deleteUser } from "../db/users.db.server";
import { deleteAndCancelTenant } from "./tenantService";

export async function deleteUserWithItsTenants(id: string) {
  const userTenants = await getMyTenants(id);
  await Promise.all(
    userTenants.map(async (userTenant) => {
      const tenantUsers = await getTenantWithUsers(userTenant.tenantId);
      if (tenantUsers?.users.length === 1 && tenantUsers.users[0].userId === id) {
        return await deleteAndCancelTenant(userTenant.tenantId);
      }
    })
  );
  await deleteUser(id);
}

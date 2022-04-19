import { db } from "../db.server";

export async function adminGetAllTenants(): Promise<any[]> {
  return await db.tenant.findMany({});
}

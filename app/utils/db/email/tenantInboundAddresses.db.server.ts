import { db } from "~/utils/db.server";

export async function getTenantInboundAddress(address: string) {
  return await db.tenantInboundAddress.findUnique({
    where: {
      address,
    },
  });
}

export async function getTenantInboundAddressById(id: string) {
  return await db.tenantInboundAddress.findUnique({
    where: {
      id,
    },
  });
}

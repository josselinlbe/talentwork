import { json, LoaderFunction } from "remix";
import { getEmployees } from "~/modules/contracts/db/employees.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getTenantFromParams } from "~/utils/services/urlService";

export const loader: LoaderFunction = async ({ request }) => {
  const tenantId = await getTenantFromParams(request.headers.get("X-Tenant-Id") ?? "");
  const tenant = await getTenant(tenantId);
  if (!tenant) {
    return json({ error: "Invalid tenant ID" }, { status: 404 });
  }
  const items = await getEmployees(tenant.id);
  return json(items);
};

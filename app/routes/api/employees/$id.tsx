import { json, LoaderFunction } from "remix";
import { getEmployee } from "~/modules/contracts/db/employees.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { getTenantFromParams } from "~/utils/services/urlService";

export const loader: LoaderFunction = async ({ request, params }) => {
  const tenantId = await getTenantFromParams(request.headers.get("X-Tenant-Id") ?? "");
  const tenant = await getTenant(tenantId);
  if (!tenant) {
    return json({ error: "Invalid tenant ID" }, { status: 404 });
  }
  const item = await getEmployee(params.id);
  if (!item) {
    return json(null, {
      status: 404,
    });
  }
  return json(item);
};

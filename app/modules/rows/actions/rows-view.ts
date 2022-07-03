import { ActionFunction, redirect } from "@remix-run/node";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { getPaginationFromCurrentUrl, getNewPaginationUrl } from "~/utils/helpers/RowPaginationHelper";
import { getTenantUrl } from "~/utils/services/urlService";

export type ActionDataRowsView = {
  error?: string;
  items?: RowWithDetails[];
  pagination?: PaginationDto;
};
export const actionRowsView: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const action = form.get("action");

  const tenantUrl = await getTenantUrl(params);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }

  let { page, sortedBy } = getPaginationFromCurrentUrl(request);
  if (action === "set-page") {
    page = Number(form.get("page"));
    if (page <= 0) {
      page = 1;
    }
  }

  if (action === "set-sort-by") {
    sortedBy.name = form.get("name")?.toString() ?? "";
    sortedBy.direction = form.get("direction") === "asc" ? "asc" : "desc";
  }

  return redirect(getNewPaginationUrl(request, page, sortedBy));
};

import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useTranslation } from "react-i18next";
import { ActionFunction, LoaderFunction, MetaFunction, redirect, useActionData } from "remix";
import { json, useLoaderData, useParams } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import RowsList from "~/components/entities/rows/RowsList";
import { getPaginationFromCurrentUrl, getNewPaginationUrl, getRowsWithPagination } from "~/utils/helpers/RowPaginationHelper";
import Constants from "~/application/Constants";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { getEntityPermission, verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppData } from "~/utils/data/useAppData";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  items: RowWithDetails[];
  pagination?: PaginationDto;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);
  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }
  await verifyUserHasPermission(request, getEntityPermission(entity, "view"), tenantUrl.tenantId);

  const currentPagination = getPaginationFromCurrentUrl(request);
  const { items, pagination } = await getRowsWithPagination(
    entity.id,
    tenantUrl.tenantId,
    userInfo.userId,
    Constants.DEFAULT_PAGE_SIZE,
    currentPagination.page,
    currentPagination.sortedBy,
    currentPagination.query
  );

  const data: LoaderData = {
    title: `${t(entity.titlePlural)} | ${process.env.APP_NAME}`,
    entity,
    items,
    pagination,
  };
  return json(data);
};

export type ActionData = {
  error?: string;
  items?: RowWithDetails[];
  pagination?: PaginationDto;
};
export const action: ActionFunction = async ({ request, params }) => {
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

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function RowsListRoute() {
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const appData = useAppData();
  const { t } = useTranslation();

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t(data.entity.titlePlural)}</h1>
          <div className="flex items-center space-x-2">
            <ButtonPrimary
              disabled={!appData.permissions.includes(getEntityPermission(data.entity, "create"))}
              to={`${UrlUtils.currentTenantUrl(params, data.entity.slug + "/new")}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>

              <div>{t("shared.new")}</div>
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* <pre>{JSON.stringify(actionData?.items)}</pre>
        <pre>{JSON.stringify(data.items)}</pre> */}
        <RowsList view="table" entity={data.entity} items={actionData?.items ?? data.items} pagination={actionData?.pagination ?? data.pagination} />
      </div>
    </div>
  );
}

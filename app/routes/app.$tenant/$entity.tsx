import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useTranslation } from "react-i18next";
import { LoaderFunction, MetaFunction, redirect } from "remix";
import { json, useLoaderData, useParams } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";
import { RowWithDetails, getRows, countRows } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import RowsList from "~/components/entities/rows/RowsList";
import Constants from "~/application/Constants";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  items: RowWithDetails[];
  totalItems: number;
  totalPages: number;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }
  // if (!params.page) {
  //   return redirect(`/app/${tenantUrl.tenantId}/${params.entity}?page=${1}`);
  // }
  const pageSize = Constants.DEFAULT_PAGE_SIZE;
  const paramsPage = new URL(request.url).searchParams.get("page");
  const paramsSort = new URL(request.url).searchParams.get("sort");
  const page = paramsPage ? Number(paramsPage) : 1;
  let orderBy: any = { createdAt: "desc" };
  if (paramsSort) {
    const column = paramsSort.replace("-", "").trim();
    if (column === "createdAt" || column === "folio") {
      orderBy = { [column]: paramsSort.startsWith("-") ? "desc" : "asc" };
    }
  }
  const items = await getRows(entity.id, tenantUrl.tenantId, pageSize, pageSize * (page - 1), orderBy);
  const totalItems = await countRows(entity.id, tenantUrl.tenantId);
  const totalPages = totalItems / pageSize;
  const data: LoaderData = {
    title: `${t(entity.titlePlural)} | ${process.env.APP_NAME}`,
    entity,
    items,
    totalItems,
    totalPages,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function RowsListRoute() {
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t(data.entity.titlePlural)}</h1>
          <div className="flex items-center space-x-2">
            <ButtonPrimary to={`${UrlUtils.currentTenantUrl(params, data.entity.slug + "/new")}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>

              <div>{t("shared.new")}</div>
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* <pre>{JSON.stringify(data.items)}</pre> */}
        {/* totalItems: {data.totalItems} */}
        <RowsList entity={data.entity} items={data.items} />
      </div>
    </div>
  );
}

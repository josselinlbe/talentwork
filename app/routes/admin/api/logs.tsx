import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import ApiKeyLogsTable from "~/components/core/apiKeys/ApiKeyLogsTable";
import InputFilters from "~/components/ui/input/InputFilters";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { ApiKeyLogWithDetails, getAllApiKeyLogs } from "~/utils/db/apiKeys.db.server";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";

type LoaderData = {
  items: ApiKeyLogWithDetails[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};
export let loader: LoaderFunction = async ({ request }) => {
  const filterableProperties: FilterablePropertyDto[] = [
    { name: "ip", title: "models.apiKeyLog.ip" },
    { name: "endpoint", title: "models.apiKeyLog.endpoint" },
    { name: "method", title: "models.apiKeyLog.method" },
    { name: "status", title: "models.apiKeyLog.status", condition: "equals", isNumber: true },
    { name: "error", title: "models.apiKeyLog.error" },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const currentPagination = getPaginationFromCurrentUrl(request);
  const { items, pagination } = await getAllApiKeyLogs(currentPagination, filters);
  const data: LoaderData = {
    items,
    pagination,
    filterableProperties,
  };
  return json(data);
};

export default function AdminApiLogsRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <IndexPageLayout
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: t("models.apiKey.plural"),
            routePath: "/admin/api/keys",
          },
          {
            name: t("models.apiKey.logs"),
            routePath: "/admin/api/logs",
          },
        ]}
        buttons={<InputFilters filters={data.filterableProperties} />}
      >
        <ApiKeyLogsTable withTenant={true} items={data.items} pagination={data.pagination} />
      </IndexPageLayout>
    </>
  );
}

import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData, useLoaderData, useSearchParams } from "@remix-run/react";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import RowsList from "~/components/entities/rows/RowsList";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputFilters, { FilterDto } from "~/components/ui/input/InputFilters";
import ViewToggleWithUrl from "~/components/ui/lists/ViewToggleWithUrl";
import ColumnSelector from "~/components/ui/tables/ColumnSelector";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import RowColumnsHelper from "~/utils/helpers/RowColumnsHelper";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import { ActionDataRowsView } from "../actions/rows-view";
import { LoaderDataRowsView } from "../loaders/rows-view";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import clsx from "clsx";

interface Props {
  title?: ReactNode;
}
export default function RowsViewRoute({ title }: Props) {
  const data = useLoaderData<LoaderDataRowsView>();
  const actionData = useActionData<ActionDataRowsView>();
  const { permissions } = useAppOrAdminData();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [columns, setColumns] = useState<ColumnDto[]>([]);
  const [groupBy, setGroupBy] = useState<{
    workflowStates?: boolean;
    property?: PropertyWithDetails;
  }>();
  const [view, setView] = useState(data.currentView?.layout ?? searchParams.get("view") ?? "table");
  const [filters, setFilters] = useState<FilterDto[]>([]);

  useEffect(() => {
    const filters: FilterDto[] = [
      ...data.entity.properties
        .filter((f) => RowFiltersHelper.isPropertyFilterable(f))
        .map((item) => {
          return {
            name: item.name,
            title: t(item.title),
            options: item.options?.map((option) => {
              return {
                color: option.color,
                name: option.value,
                value: option.value,
              };
            }),
          };
        }),
      {
        name: "tag",
        title: t("models.tag.plural"),
        options: data.tags.map((tag) => {
          return {
            color: tag.color,
            name: tag.value,
            value: tag.value,
          };
        }),
      },
    ];
    if (data.entity.workflowStates) {
      filters.push({
        name: "workflowState",
        title: t("models.workflowState.object"),
        options: data.entity.workflowStates.map((workflowState) => {
          return {
            color: workflowState.color,
            name: t(workflowState.title),
            value: workflowState.name,
          };
        }),
      });
    }
    setFilters(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const newView = data.currentView?.layout ?? searchParams.get("view") ?? "table";
    setView(newView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (data.currentView) {
      if (data.currentView.groupByWorkflowStates) {
        setGroupBy({ workflowStates: true });
      } else if (data.currentView.groupByPropertyId) {
        const property = data.entity.properties.find((f) => f.id === data.currentView?.groupByPropertyId);
        if (property) {
          setGroupBy({ property });
        }
      }
    } else {
      const property = data.entity.properties.find((f) => f.type === PropertyType.SELECT && !f.isHidden && !f.isDetail);
      if (property) {
        setGroupBy({ property });
      }
    }
  }, [data.currentView, data.entity.properties]);

  useEffect(() => {
    if (!data.currentView) {
      const columns = RowColumnsHelper.getDefaultEntityColumns(data.entity);
      if (view === "board") {
        setColumns(columns.filter((f) => f.name !== groupBy?.property?.name));
      }
      setColumns(columns);
    } else {
      const columns = data.currentView.properties.map((item) => {
        const property = data.entity.properties.find((f) => f.id === item.propertyId);
        return {
          name: property?.name ?? "",
          title: property?.title ?? "",
          visible: true,
        };
      });
      if (data.currentView.layout === "board") {
        setColumns(columns.filter((f) => f.name !== groupBy?.property?.name));
      } else {
        setColumns(columns);
      }
    }
  }, [data.currentView, data.entity, groupBy?.property?.name, view]);

  function setEntityView(name: string) {
    if (data.views.find((f) => f.name === name && f.isDefault)) {
      searchParams.delete("v");
    } else {
      searchParams.set("v", name);
    }
    searchParams.delete("page");
    setSearchParams(searchParams);
  }

  return (
    <div className={clsx("space-y-2", data.views.length > 1 && "py-2")}>
      <div className={clsx(data.views.length <= 1 && "bg-white shadow-sm border-b border-gray-300 w-full py-2")}>
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          {data.views.length > 1 ? (
            <TabsWithIcons
              tabs={data.views.map((item) => {
                return {
                  name: t(item.title),
                  onClick: () => setEntityView(item.name),
                  current: data.currentView?.name === item.name,
                };
              })}
            />
          ) : (
            title ?? <h1 className="flex-1 font-bold flex items-center truncate">{t(data.currentView?.title ?? data.entity.titlePlural)}</h1>
          )}
          <div className="flex items-center space-x-1">
            {!data.currentView && (
              <>
                {groupBy && <ViewToggleWithUrl className="hidden sm:flex" />}
                <ColumnSelector setItems={setColumns} items={columns} onClear={() => setColumns(RowColumnsHelper.getDefaultEntityColumns(data.entity))} />
              </>
            )}

            {filters.length > 0 && <InputFilters filters={filters} />}
            <ButtonPrimary disabled={!permissions.includes(getEntityPermission(data.entity, "create"))} to="new">
              <span className="sm:text-sm">+</span>
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <div className="pb-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <RowsList
          columns={columns}
          view={view}
          entity={data.entity}
          items={actionData?.items ?? data.items}
          pagination={actionData?.pagination ?? data.pagination}
          groupBy={groupBy}
          numberOfColumns={data.currentView?.columns ?? undefined}
        />
      </div>
    </div>
  );
}

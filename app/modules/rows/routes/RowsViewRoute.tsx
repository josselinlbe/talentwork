import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData, useActionData, useSearchParams } from "remix";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import RowsList from "~/components/entities/rows/RowsList";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputFilters from "~/components/ui/input/InputFilters";
import ViewToggleWithUrl from "~/components/ui/lists/ViewToggleWithUrl";
import ColumnSelector from "~/components/ui/tables/ColumnSelector";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import RowColumnsHelper from "~/utils/helpers/RowColumnsHelper";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import { ActionDataRowsView } from "../actions/rows-view";
import { LoaderDataRowsView } from "../loaders/rows-view";

interface Props {
  title?: ReactNode;
}
export default function RowsViewRoute({ title }: Props) {
  const data = useLoaderData<LoaderDataRowsView>();
  const actionData = useActionData<ActionDataRowsView>();
  const { permissions } = useAppOrAdminData();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [columns, setColumns] = useState<ColumnDto[]>([]);
  const [groupByProperty, setGroupByProperty] = useState<PropertyWithDetails>();
  const [view, setView] = useState("");

  useEffect(() => {
    const newView = searchParams.get("view") ?? "table";
    setView(newView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setGroupByProperty(data.entity.properties.find((f) => f.type === PropertyType.SELECT && !f.isHidden && !f.isDetail));
  }, [data.entity.properties]);

  useEffect(() => {
    const columns = RowColumnsHelper.getDefaultEntityColumns(data.entity);
    if (view === "table") {
      setColumns(columns);
    } else if (view === "board") {
      setColumns(columns.filter((f) => f.name !== groupByProperty?.name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, groupByProperty]);

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          {title ?? <h1 className="flex-1 font-bold flex items-center truncate">{t(data.entity.titlePlural)}</h1>}
          <div className="flex items-center space-x-1">
            {groupByProperty && <ViewToggleWithUrl className="hidden sm:flex" />}

            <ColumnSelector setItems={setColumns} items={columns} onClear={() => setColumns(RowColumnsHelper.getDefaultEntityColumns(data.entity))} />

            {data.entity.properties.filter((f) => f.type === PropertyType.TEXT).length > 0 && (
              <InputFilters
                filters={[
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
                ]}
              />
            )}
            <ButtonPrimary disabled={!permissions.includes(getEntityPermission(data.entity, "create"))} to="new">
              <span className="sm:text-sm">+</span>
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <RowsList
          columns={columns}
          view={view}
          entity={data.entity}
          items={actionData?.items ?? data.items}
          pagination={actionData?.pagination ?? data.pagination}
          groupBy={groupByProperty}
        />
      </div>
    </div>
  );
}

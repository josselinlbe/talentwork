import RowsListAndTable from "./RowsListAndTable";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import KanbanSimple, { KanbanColumn } from "~/components/ui/lists/KanbanSimple";
import RowHelper from "~/utils/helpers/RowHelper";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import RowCard from "./RowCard";
import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import clsx from "clsx";

interface Props {
  view: string;
  entity: EntityWithDetails;
  items: RowWithDetails[];
  columns: ColumnDto[];
  pagination?: PaginationDto;
  groupBy?: {
    workflowStates?: boolean;
    property?: PropertyWithDetails;
  };
  numberOfColumns?: number;
}
export default function RowsList({ view, entity, items, columns, pagination, groupBy, numberOfColumns }: Props) {
  const { t } = useTranslation();

  const [options, setOptions] = useState<KanbanColumn<RowWithDetails>[]>([]);
  useEffect(() => {
    if (groupBy?.workflowStates) {
      setOptions(
        entity.workflowStates.map((option) => {
          return {
            name: option.id,
            color: option.color,
            title: (
              <div className="flex space-x-1 items-center">
                <div className="font-bold">{option.title}</div>
              </div>
            ),
            value: (i: RowWithDetails) => <RowCard layout={view} item={i} entity={entity} columns={columns} />,
            onClickRoute: (i: RowWithDetails) => i.id,
          };
        })
      );
    } else if (groupBy?.property) {
      setOptions(
        groupBy.property.options.map((option) => {
          return {
            name: option.value,
            color: option.color,
            title: (
              <div className="flex space-x-1 items-center">
                {option.name ? <div className="font-bold">{option.name}</div> : <div className="font-bold">{option.value}</div>}
              </div>
            ),
            value: (i: RowWithDetails) => <RowCard layout={view} item={i} entity={entity} columns={columns} />,
            onClickRoute: (i: RowWithDetails) => i.id,
            onNewRoute: (columnValue: string) => `new?${groupBy?.property?.name}=${columnValue}`,
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy]);

  return (
    <div>
      {view == "table" && <RowsListAndTable columns={columns} entity={entity} items={items} pagination={pagination} />}

      {view === "board" && groupBy && (
        <KanbanSimple
          className="pt-2"
          items={items}
          filterValue={(item, column) => {
            if (groupBy.workflowStates) {
              return item.workflowStateId === column?.name;
            } else if (groupBy.property) {
              const value = RowHelper.getPropertyValue(entity, item, groupBy.property);
              if (column === null && !value) {
                return true;
              }
              return value === column?.name;
            }
            return false;
          }}
          columns={options}
          undefinedColumn={{
            name: t("shared.undefined"),
            color: Colors.UNDEFINED,
            title: (
              <div className="flex space-x-1 items-center">
                <div className="font-bold">{t("shared.undefined")}</div>
              </div>
            ),
            value: (i: RowWithDetails) => <RowCard layout={view} item={i} entity={entity} columns={columns} />,
            onClickRoute: (i: RowWithDetails) => i.id,
          }}
          column={groupBy.workflowStates ? "workflowStateId" : groupBy.property?.name ?? ""}
        />
      )}

      {view === "grid" && (
        <div>
          <div
            className={clsx(
              "grid gap-3",
              numberOfColumns === 1 && "grid-cols-1",
              numberOfColumns === 2 && "grid-cols-2",
              (!numberOfColumns || numberOfColumns === 3) && "grid-cols-3",
              numberOfColumns === 4 && "grid-cols-4",
              numberOfColumns === 5 && "grid-cols-5",
              numberOfColumns === 6 && "grid-cols-6",
              numberOfColumns === 7 && "grid-cols-7",
              numberOfColumns === 8 && "grid-cols-8",
              numberOfColumns === 9 && "grid-cols-9",
              numberOfColumns === 10 && "grid-cols-10",
              numberOfColumns === 11 && "grid-cols-11",
              numberOfColumns === 12 && "grid-cols-12"
            )}
          >
            {items.map((item) => {
              return (
                <div key={item.id} className="bg-white rounded-md shadow-sm border border-gray-300 group hover:bg-gray-50 p-3 w-full text-left truncate">
                  <Link to={item.id}>
                    <RowCard layout={view} item={item} entity={entity} columns={columns} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

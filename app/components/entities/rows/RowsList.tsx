import RowsListAndTable from "./RowsListAndTable";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import KanbanSimple from "~/components/ui/lists/KanbanSimple";
import RowHelper from "~/utils/helpers/RowHelper";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import RowCard from "./RowCard";

interface Props {
  view: string;
  entity: EntityWithDetails;
  items: RowWithDetails[];
  columns: ColumnDto[];
  pagination?: PaginationDto;
  groupBy?: PropertyWithDetails;
}
export default function RowsList({ view, entity, items, columns, pagination, groupBy }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      {view == "table" && <RowsListAndTable columns={columns} entity={entity} items={items} pagination={pagination} />}

      {view === "board" && groupBy && (
        <KanbanSimple
          className="pt-2"
          items={items}
          filterValue={(item, column) => {
            const value = RowHelper.getPropertyValue(entity, item, groupBy);
            if (column === null && !value) {
              return true;
            }
            return value === column?.name;
          }}
          columns={groupBy.options.map((option) => {
            return {
              name: option.value,
              color: option.color,
              title: (
                <div className="flex space-x-1 items-center">
                  <div className="font-bold">{option.value}</div>
                </div>
              ),
              value: (i: RowWithDetails) => <RowCard item={i} entity={entity} columns={columns} />,
              onClickRoute: (i: RowWithDetails) => i.id,
              onNewRoute: (columnValue: string) => `new?${groupBy.name}=${columnValue}`,
            };
          })}
          undefinedColumn={{
            name: t("shared.undefined"),
            color: Colors.UNDEFINED,
            title: (
              <div className="flex space-x-1 items-center">
                <div className="font-bold">{t("shared.undefined")}</div>
              </div>
            ),
            value: (i: RowWithDetails) => <RowCard item={i} entity={entity} columns={columns} />,
            onClickRoute: (i: RowWithDetails) => i.id,
          }}
          column={groupBy.name}
        />
      )}
    </div>
  );
}

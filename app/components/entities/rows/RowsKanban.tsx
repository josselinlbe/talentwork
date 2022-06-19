import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import { useEffect, useState } from "react";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import RowHelper from "~/utils/helpers/RowHelper";
import clsx from "clsx";
import { Property } from "@prisma/client";
import { Link } from "remix";

interface Props {
  entity: EntityWithDetails;
  items: RowWithDetails[];
  className?: string;
}
export default function RowsKanban({ entity, items, className }: Props) {
  const [columns, setColumns] = useState<{ name: string; title: string; color?: Colors }[]>([]);
  const [columnsProperty, setColumnsProperty] = useState<Property>();

  useEffect(() => {
    const optionsField = entity.properties.find((f) => f.type === PropertyType.SELECT);
    if (optionsField) {
      setColumns(
        optionsField.options
          .sort((a, b) => a.order - b.order)
          .map((option) => {
            return {
              name: option.value,
              title: option.value,
              color: Colors.BLUE,
            };
          })
      );
    }
    setColumnsProperty(optionsField);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getItems(columnName: string) {
    return items.filter((f) => f.values.find((f) => f.propertyId === columnsProperty?.id && f.textValue === columnName));
  }
  return (
    <div className={clsx(className, "flex space-x-4 overflow-x-auto")}>
      {columns.map((column) => {
        return (
          <div key={column.name} className="text-sm w-64 shrink-0 bg-gray-50 p-2 shadow-sm border border-gray-200 rounded-md h-96 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex space-x-2 justify-between">
                <div className="flex space-x-2 items-center">
                  {column.color && (
                    <div>
                      <ColorBadge color={column.color} />
                    </div>
                  )}
                  <div>{column.title}</div>
                </div>
                {/* <button type="button" onClick={onNew(column.name)}>
                  <PlusIcon className="h-3 w-3" />
                </button> */}
              </div>
              {getItems(column.name).map((item) => {
                return (
                  <div key={item.id} className="bg-white rounded-md shadow-sm border border-gray-300 group hover:bg-gray-50 p-2">
                    <Link to={item.id} className="space-y-0.5 text-xs">
                      {entity.properties
                        .filter((f) => !f.isDefault && !f.isDetail && f.id !== columnsProperty?.id)
                        .map((property, idxProp) => {
                          return (
                            <div key={property.name}>
                              <span className={clsx(idxProp === 0 && "font-bold")}>{RowHelper.getPropertyValue(entity, item, property)}</span>
                            </div>
                          );
                        })}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

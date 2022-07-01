import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import DateUtils from "~/utils/shared/DateUtils";
import { useEffect, useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useParams } from "remix";
import { Property } from "@prisma/client";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import TableSimple from "~/components/ui/tables/TableSimple";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";
import RowDisplayValueHelper from "~/utils/helpers/RowDisplayValueHelper";

interface Props {
  entity: EntityWithDetails;
  items: RowWithDetails[];
  columns: ColumnDto[];
  pagination?: PaginationDto;
  className?: string;
}

// type Header = {
//   name?: string;
//   title: string;
// };

export default function RowsListAndTable({ entity, items, pagination, className = "", columns }: Props) {
  const { t } = useTranslation();

  const [sortByColumn, setSortByColumn] = useState<Property>();
  const [sortDirection, setSortDirection] = useState(-1);
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);

  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders(entity, columns));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, columns]);

  function sortBy(column?: string) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(entity.properties.find((f) => f.name === column));
    }
  }
  const sortedItems = () => {
    if (!items) {
      return [];
    }
    // const column = entity.properties.find((f) => f.name === sortByColumn);
    if (!sortByColumn) {
      return items;
    }
    return items.slice().sort((x, y) => {
      const xValue = RowHelper.getPropertyValue(entity, x, sortByColumn);
      const yValue = RowHelper.getPropertyValue(entity, y, sortByColumn);
      if (xValue && yValue) {
        return (xValue > yValue ? sortDirection * -1 : sortDirection) ?? sortDirection * -1;
      }
      return sortDirection * -1;
    });
  };

  function getEditRoute(item: RowWithDetails) {
    if (item.tenant) {
      return `/app/${item.tenant.slug}/${entity.slug}/${item.id}`;
    } else {
      return `${item.id}`;
    }
  }

  return (
    <div className={className}>
      <div>
        <TableSimple
          headers={headers}
          items={items}
          pagination={pagination}
          actions={[
            {
              title: t("shared.edit"),
              onClickRoute: (_, item) => getEditRoute(item),
            },
          ]}
        />
      </div>
    </div>
  );
}

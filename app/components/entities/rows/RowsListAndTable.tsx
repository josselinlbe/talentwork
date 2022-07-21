import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import TableSimple from "~/components/ui/tables/TableSimple";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";

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

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);

  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders(entity, columns, "table"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, columns]);

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

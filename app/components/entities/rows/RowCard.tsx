import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";
import RowDisplayValueHelper from "~/utils/helpers/RowDisplayValueHelper";

interface Props {
  entity: EntityWithDetails;
  item: RowWithDetails;
  columns: ColumnDto[];
  layout: string;
}
export default function RowCard({ entity, item, columns, layout }: Props) {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);

  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders(entity, columns, layout));
  }, [entity, columns, layout]);

  return (
    <div className="flex flex-col whitespace-nowrap text-sm text-gray-600 space-y-2">
      {headers.map((header, idx) => {
        return (
          <div key={idx} className={clsx("truncate flex flex-col", header.className)}>
            <div className="text-xs font-medium text-gray-400">{t(header.title)}</div>
            <div>{RowDisplayValueHelper.displayRowValue(t, header, item, idx)}</div>
          </div>
        );
      })}
    </div>
  );
}

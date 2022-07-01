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
}
export default function RowCard({ entity, item, columns }: Props) {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);

  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders(entity, columns));
  }, [entity, columns]);

  return (
    <div className="flex flex-col whitespace-nowrap text-sm text-gray-600">
      {headers.map((header, idx) => {
        return (
          <span key={idx} className="truncate">
            {RowDisplayValueHelper.displayRowValue(t, header, item, idx)}
          </span>
        );
      })}
    </div>
  );
}

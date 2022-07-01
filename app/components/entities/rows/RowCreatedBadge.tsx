import { RowWithCreatedBy } from "~/utils/db/entities/rows.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import RowCreatedByBadge from "./RowCreatedByBadge";

interface Props {
  row: RowWithCreatedBy;
  withEmail?: boolean;
}
export default function RowCreatedBadge({ row, withEmail = true }: Props) {
  return (
    <div className="flex flex-col">
      <div>{DateUtils.dateAgo(row.createdAt)}</div>
      <RowCreatedByBadge row={row} withEmail={withEmail} />
    </div>
  );
}

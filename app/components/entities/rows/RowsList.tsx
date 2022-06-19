import RowsListAndTable from "./RowsListAndTable";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";
import InputSearch from "~/components/ui/input/InputSearch";
import { useState } from "react";
import RowHelper from "~/utils/helpers/RowHelper";
import RowsKanban from "./RowsKanban";

interface Props {
  view: "table" | "kanban";
  entity: EntityWithDetails;
  items: RowWithDetails[];
  pagination?: PaginationDto;
  withTenant?: boolean;
}
export default function RowsList({ view, entity, items, pagination, withTenant = false }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const filteredItems = () => {
    if (!items || !pagination) {
      return [];
    }
    const filtered = items.filter((f) => RowHelper.search(entity, f, searchInput));

    return filtered;
  };

  return (
    <div>
      {view == "table" && (
        <div className="space-y-2">
          {pagination ? <InputSearchWithURL /> : <InputSearch value={searchInput} setValue={setSearchInput} />}
          <RowsListAndTable withTenant={withTenant} entity={entity} items={filteredItems()} pagination={pagination} />
        </div>
      )}

      {view === "kanban" && (
        <div className="space-y-4">
          {pagination ? <InputSearchWithURL onNewRoute={"new"} /> : <InputSearch value={searchInput} setValue={setSearchInput} />}
          <RowsKanban className="mt-2" entity={entity} items={filteredItems()} />
        </div>
      )}
    </div>
  );
}

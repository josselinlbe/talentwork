import { useState } from "react";
import RowsListAndTable from "./RowsListAndTable";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import InputSearch from "~/components/ui/input/InputSearch";

interface Props {
  entity: EntityWithDetails;
  items: RowWithDetails[];
  withTenant?: boolean;
}
export default function RowsList({ entity, items, withTenant = false }: Props) {
  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    const filtered = items.filter((f) => RowHelper.search(entity, f, searchInput));

    return filtered;
  };

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <RowsListAndTable entity={entity} items={filteredItems()} withTenant={withTenant} />
    </div>
  );
}

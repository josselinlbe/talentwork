import { useTranslation } from "react-i18next";
import { useState } from "react";
import EntityRowsListAndTable from "./EntityRowsListAndTable";
import { EntityRowWithDetails } from "~/utils/db/entityRows.db.server";
import { EntityWithDetails } from "~/utils/db/entities.db.server";
import EntityRowHelper from "~/utils/helpers/EntityRowHelper";
import InputSearch from "../ui/input/InputSearch";

interface Props {
  entity: EntityWithDetails;
  items: EntityRowWithDetails[];
  withTenant?: boolean;
}
export default function EntityRowsList({ entity, items, withTenant = false }: Props) {
  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    const filtered = items.filter((f) => EntityRowHelper.search(entity, f, searchInput));

    return filtered;
  };

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <EntityRowsListAndTable entity={entity} items={filteredItems()} withTenant={withTenant} />
    </div>
  );
}

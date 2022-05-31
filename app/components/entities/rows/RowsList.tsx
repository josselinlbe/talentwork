import RowsListAndTable from "./RowsListAndTable";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import InputSearchWithURL from "~/components/ui/input/InputSearchWithURL";

interface Props {
  entity: EntityWithDetails;
  items: RowWithDetails[];
  pagination?: PaginationDto;
  withTenant?: boolean;
}
export default function RowsList({ entity, items, pagination, withTenant = false }: Props) {
  // const [searchInput, setSearchInput] = useState("");
  // const filteredItems = () => {
  //   if (!items) {
  //     return [];
  //   }
  //   const filtered = items.filter((f) => RowHelper.search(entity, f, searchInput));

  //   return filtered;
  // };

  return (
    <div className="space-y-2">
      {/* TODO: IMPLEMENT SEARCH WITH URL ?query={SEARCH_INPUT} */}
      <InputSearchWithURL />
      <RowsListAndTable withTenant={withTenant} entity={entity} items={items} pagination={pagination} />
    </div>
  );
}

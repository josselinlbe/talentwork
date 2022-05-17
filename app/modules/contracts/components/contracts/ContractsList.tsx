import { useTranslation } from "react-i18next";
import { useState } from "react";
import ContractsListAndTable from "./ContractsListAndTable";
import { getContracts } from "~/modules/contracts/db/contracts.db.server";
import InputSearch from "~/components/ui/input/InputSearch";

interface Props {
  items: Awaited<ReturnType<typeof getContracts>>;
}

export default function ContractsList({ items }: Props) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.description?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.row?.linkedAccount?.providerTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.row?.linkedAccount?.clientTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.row?.createdByUser?.email?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  return (
    <div>
      <div>
        <div className="space-y-2">
          <div className="flex justify-between items-center space-x-0">
            <div className="space-y-2 sm:space-y-0 flex-col text-right sm:flex-row flex sm:items-center sm:space-x-3"></div>
          </div>
          <InputSearch value={searchInput} setValue={setSearchInput} />
          <ContractsListAndTable items={filteredItems()} />
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { useState } from "react";
import EmployeesListAndTable from "./EmployeesListAndTable";
import { Employee } from "@prisma/client";
import InputSearch from "~/components/ui/input/InputSearch";

interface Props {
  items: Employee[];
}
export default function EmployeesList({ items }: Props) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    const filtered = items.filter(
      (f) =>
        f.id?.toUpperCase().includes(searchInput.toUpperCase()) ||
        f.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );

    return filtered;
  };

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      <EmployeesListAndTable items={filteredItems()} />
    </div>
  );
}

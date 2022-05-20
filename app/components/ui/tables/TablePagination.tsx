import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "remix";
import ButtonSecondary from "../buttons/ButtonSecondary";

interface Props {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onChange: (page: number) => void;
}
export default function TablePagination({ page, pageSize, totalItems, onChange, totalPages }: Props) {
  const { t } = useTranslation();
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  useEffect(() => {
    setFrom(page * pageSize - pageSize + 1);

    let to = page * pageSize;
    if (to > totalItems) {
      to = totalItems;
    }
    setTo(to);
  }, [page, pageSize]);
  return (
    <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6" aria-label="Pagination">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          {t("shared.showing")} <span className="font-medium">{from}</span> {t("shared.to").toLowerCase()} <span className="font-medium">{to}</span>{" "}
          {t("shared.of").toLowerCase()} <span className="font-medium">{totalItems}</span> {t("shared.results").toLowerCase()}
        </p>
      </div>
      <div className="flex-1 flex justify-between sm:justify-end space-x-2">
        <ButtonSecondary disabled={page === 1} onClick={() => onChange(page - 1)}>
          {t("shared.previous")}
        </ButtonSecondary>
        <ButtonSecondary disabled={page >= totalPages} type="button" onClick={() => onChange(page + 1)}>
          {t("shared.next")}
        </ButtonSecondary>
      </div>
    </nav>
  );
}

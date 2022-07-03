import { EntityWorkflowState } from "@prisma/client";
import { t } from "i18next";
import { Link } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";
import RowCreatedBadge from "~/components/entities/rows/RowCreatedBadge";
import KanbanSimple from "~/components/ui/lists/KanbanSimple";
import TableSimple from "~/components/ui/tables/TableSimple";
import { DealWithDetails } from "~/utils/db/crm/deals.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import NumberUtils from "~/utils/shared/NumberUtils";

interface Props {
  items: DealWithDetails[];
  view: string;
  workflowStates: EntityWorkflowState[];
}
export default function DealsView({ items, view, workflowStates }: Props) {
  function getTotal(column: string | null) {
    let total = 0;
    items
      .filter((f) => f.row.workflowStateId === column)
      .forEach((item) => {
        total += Number(item.value ?? 0);
      });
    return total;
  }
  return (
    <>
      {view === "table" && (
        <TableSimple
          items={items}
          headers={[
            {
              name: "contact",
              title: "Contact",
              value: (i) => i.contact.email,
              formattedValue: (i) => (
                <div className="flex flex-col">
                  <div className="font-medium">{i.contact.email}</div>
                  <div>
                    {i.contact.firstName} {i.contact.lastName}
                  </div>
                </div>
              ),
            },
            {
              name: "name",
              title: "Name",
              value: (i) => i.name,
              className: "w-full",
            },
            {
              name: "value",
              title: "Value",
              value: (i) => i.value,
              formattedValue: (i) => <div>${NumberUtils.decimalFormat(Number(i.value))}</div>,
            },
            {
              name: "subscriptionPrice",
              title: "Product",
              value: (i) => t(i.subscriptionPrice?.subscriptionProduct?.title ?? ""),
              formattedValue: (i) => (
                <>
                  {i.subscriptionPrice && (
                    <Link to={`/admin/setup/pricing/edit/${i.subscriptionPrice.subscriptionProduct.id}`} className="hover:underline">
                      {t(i.subscriptionPrice?.subscriptionProduct?.title ?? "")}
                    </Link>
                  )}
                </>
              ),
            },
            {
              name: "created",
              title: t("shared.created"),
              value: (i) => DateUtils.dateAgo(i.createdAt),
              formattedValue: (i) => <RowCreatedBadge row={i.row} withEmail={false} />,
            },
          ]}
          actions={[
            {
              title: t("shared.edit"),
              onClickRoute: (_, i) => i.rowId,
            },
          ]}
        />
      )}

      {view === "board" && (
        <KanbanSimple
          className="pt-2"
          items={items}
          column=""
          filterValue={(item, column) => {
            return (column === null && item.row.workflowStateId === null) || column?.name === item.row.workflowStateId;
          }}
          columns={workflowStates.map((item) => {
            return {
              name: item.id,
              color: item.color,
              title: (
                <div className="flex space-x-1 items-center">
                  <div className="font-bold">{item.title}</div>
                  <div>-</div>
                  <div className=" text-gray-500">${NumberUtils.decimalFormat(getTotal(item.name))}</div>
                </div>
              ),
              value: (i: DealWithDetails) => <DealCard item={i} />,
              onClickRoute: (i: DealWithDetails) => i.rowId,
            };
          })}
          undefinedColumn={{
            name: "",
            color: Colors.UNDEFINED,
            title: (
              <div className="flex space-x-1 items-center">
                <div className="font-bold">{t("shared.undefined")}</div>
                <div>-</div>
                <div className=" text-gray-500">${NumberUtils.decimalFormat(getTotal(null))}</div>
              </div>
            ),
            value: (i: DealWithDetails) => <DealCard item={i} />,
            onClickRoute: (i: DealWithDetails) => i.rowId,
          }}
        />
      )}
    </>
  );
}

function DealCard({ item }: { item: DealWithDetails }) {
  return (
    <div className="flex flex-col text-left">
      <div className="font-bold">{item.name}</div>
      <div>
        {item.contact.firstName} {item.contact.lastName} <span className="text-gray-500 text-xs italic">({item.contact.email})</span>
      </div>
      <div className="italic flex items-center space-x-2">
        {item.subscriptionPrice && (
          <>
            <Link to={`/admin/setup/pricing/edit/${item.subscriptionPrice.subscriptionProduct.id}`} className="hover:underline">
              {item.subscriptionPrice && t(item.subscriptionPrice.subscriptionProduct.title)}
            </Link>
            <div>-</div>
          </>
        )}
        <div>{NumberUtils.decimalFormat(Number(item.value ?? 0))}</div>
      </div>
    </div>
  );
}

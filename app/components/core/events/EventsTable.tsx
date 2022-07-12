import { Link } from "@remix-run/react";
import { useState } from "react";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import InputText from "~/components/ui/input/InputText";
import OpenModal from "~/components/ui/modals/OpenModal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { EventWithAttempts } from "~/utils/db/events/events.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import StatusBadge from "./StatusBadge";

interface Props {
  items: EventWithAttempts[];
  pagination: PaginationDto;
}
export default function EventsTable({ items, pagination }: Props) {
  const [selectedData, setSelectedData] = useState<EventWithAttempts | undefined>(undefined);
  return (
    <>
      <TableSimple
        items={items}
        actions={[
          {
            title: "Details",
            onClickRoute: (_, i) => i.id,
          },
        ]}
        pagination={pagination}
        headers={[
          {
            name: "account",
            title: "Account",
            value: (i) => i.tenant?.name,
          },
          {
            name: "event",
            title: "Event",
            value: (i) => i.name,
            formattedValue: (i) => <SimpleBadge title={i.name} color={Colors.VIOLET} />,
          },
          {
            name: "data",
            title: "Data",
            value: (i) => i.data,
            formattedValue: (i) => (
              <button type="button" onClick={() => setSelectedData(i)} className="truncate max-w-xs underline hover:text-theme-500">
                {i.data}
              </button>
            ),
            className: "w-full",
          },
          {
            name: "attempts",
            title: "Webhook Attempts",
            value: (i) => i.attempts.length,
            formattedValue: (i) => (
              <div className="flex space-x-1">
                {i.attempts.map((f, idx) => (
                  <Link to={i.id + "?attempt=" + f.id} key={idx}>
                    <StatusBadge startedAt={f.startedAt} finishedAt={f.finishedAt} endpoint={f.endpoint} status={f.status} />
                  </Link>
                ))}
              </div>
            ),
          },
          {
            name: "createdAt",
            title: "shared.createdAt",
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-gray-400 text-xs",
            breakpoint: "sm",
            sortable: true,
          },
        ]}
      />

      {selectedData && (
        <OpenModal className="max-w-md" onClose={() => setSelectedData(undefined)}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <h3>
                <SimpleBadge className="text-lg" title={selectedData.name} color={Colors.VIOLET} />
              </h3>
              <div className="flex items-center space-x-2">
                <div className="text-gray-500 text-sm">{DateUtils.dateYMDHMS(selectedData.createdAt)}</div>
                <Link to={selectedData.id} className="text-gray-500 hover:text-gray-700">
                  <ExternalLinkEmptyIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-xs">Request Body</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg">
                <div className="prose">
                  <pre>{selectedData.data}</pre>
                </div>
              </div>
            </div>

            {selectedData.attempts.map((attempt, idx) => {
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center space-x-2 justify-between">
                    <h3 className="font-bold text-xs">Webhook Attempt #{idx + 1}</h3>
                    <StatusBadge endpoint={attempt.endpoint} status={attempt.status} startedAt={attempt.startedAt} finishedAt={attempt.finishedAt} />
                  </div>
                  <div className="grid grid-cols-12 gap-2 border border-dashed border-gray-300 rounded-md p-2">
                    <InputText className="col-span-12" name="endpoint" title="Endpoint" readOnly={true} value={attempt.endpoint} />
                    <InputText className="col-span-12" name="startedAt" title="Started at" readOnly={true} value={DateUtils.dateYMDHMS(attempt.startedAt)} />
                    <InputText className="col-span-12" name="finishedAt" title="Finished at" readOnly={true} value={DateUtils.dateYMDHMS(attempt.finishedAt)} />
                    <InputText className="col-span-12" name="status" title="Status" readOnly={true} value={attempt.status?.toString() ?? "?"} />
                    <InputText className="col-span-12" name="message" title="Message" readOnly={true} value={attempt.message?.toString() ?? "?"} />
                  </div>
                </div>
              );
            })}
          </div>
        </OpenModal>
      )}
    </>
  );
}

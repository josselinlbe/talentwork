import { useSearchParams } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import InputText from "~/components/ui/input/InputText";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import { EventWithDetails } from "~/utils/db/events/events.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import StatusBadge from "./StatusBadge";

interface Props {
  item: EventWithDetails;
}
export default function EventDetails({ item }: Props) {
  const [searchParams] = useSearchParams();
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between border-b border-gray-100 pb-3">
        <h3>
          <SimpleBadge className="text-lg" title={item.name} color={Colors.VIOLET} />
        </h3>
      </div>

      <div className="space-y-2">
        <p className="font-bold text-xs">Request Body</p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg">
          <div className="prose">
            <pre>{item.data}</pre>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputText name="createdAt" title="Created at" value={DateUtils.dateYMDHMS(item.createdAt)} readOnly={true} />
        <InputText name="account" title="Account" value={item.tenant?.name ?? ""} readOnly={true} />
      </div>

      {item.attempts.map((attempt, idx) => {
        return (
          <div key={idx} className="space-y-3">
            <CollapsibleRow
              key={idx}
              value={
                <div className="truncate">
                  <div className="flex items-center space-x-2 justify-between truncate">
                    <div className="flex flex-col truncate">
                      <h3 className="font-bold text-sm">Webhook Attempt #{idx + 1}</h3>
                      <div className="text-xs text-gray-500 italic truncate">{attempt.endpoint}</div>
                    </div>
                    <div className=" flex-shrink-0">
                      <StatusBadge endpoint={attempt.endpoint} status={attempt.status} startedAt={attempt.startedAt} finishedAt={attempt.finishedAt} />
                    </div>
                  </div>
                </div>
              }
              title={`Webhook Attempt #${idx + 1}`}
              initial={item.attempts.length === 1 || searchParams.getAll("attempt").includes(attempt.id)}
            >
              <div key={idx} className="space-y-2 pb-4">
                <div className="grid lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-6 space-y-2 overflow-x-auto">
                    <div className="font-medium text-sm text-gray-600">Request</div>
                    <div className="grid grid-cols-12 gap-2 border border-dashed border-gray-300 rounded-md p-2 bg-gray-50 pb-3.5">
                      <InputText className="col-span-12 truncate" name="endpoint" title="Endpoint" readOnly={true} value={attempt.endpoint} />
                      <InputText className="col-span-6" name="startedAt" title="Started at" readOnly={true} value={DateUtils.dateYMDHMS(attempt.startedAt)} />
                      <InputText
                        className="col-span-6"
                        name="finishedAt"
                        title="Finished at"
                        readOnly={true}
                        value={DateUtils.dateYMDHMS(attempt.finishedAt)}
                      />
                      <InputText className="col-span-6" name="status" title="Status" readOnly={true} value={attempt.status?.toString() ?? "?"} />
                      <InputText className="col-span-6" name="message" title="Message" readOnly={true} value={attempt.message?.toString() ?? "?"} />
                    </div>
                  </div>
                  <div className="lg:col-span-6 space-y-2 overflow-x-auto">
                    <div className="flex justify-between space-x-2">
                      <div className="font-medium text-sm text-gray-600">Response</div>
                      <div>
                        <StatusBadge endpoint={attempt.endpoint} status={attempt.status} startedAt={attempt.startedAt} finishedAt={attempt.finishedAt} />
                      </div>
                    </div>
                    <div>
                      <div className="border border-dashed border-gray-300 rounded-md p-2 bg-gray-50 space-y-1">
                        <h3 className="font-medium text-xs text-gray-600">Data</h3>
                        <div>
                          <div className="prose">
                            <pre className="h-44">{attempt.body}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleRow>
          </div>
        );
      })}
    </div>
  );
}

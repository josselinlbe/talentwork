import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { LogWithDetails } from "~/utils/db/logs.db.server";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: LogWithDetails[];
}

export default function RowLogs({ items }: Props) {
  const { t } = useTranslation();

  const sortedItems = () => {
    return items.slice().sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return x.createdAt > y.createdAt ? -1 : 1;
      }
      return -1;
    });
  };

  function dateDM(value: Date | undefined) {
    return DateUtils.dateDM(value);
  }

  return (
    <div>
      <div className="space-y-3">
        <h3 className="text-sm leading-3 font-medium text-gray-800">
          <div className="flex space-x-1 items-center">
            <div>
              <span className=" italic font-light"></span> {t("app.shared.activity.title")}
            </div>
          </div>
        </h3>
        <div className="bg-white py-5 px-4 shadow border border-gray-100 rounded-md">
          <div className="flow-root">
            <ul className="-mb-8">
              {sortedItems().length === 0 && <div className=" text-gray-500 italic mb-6 flex justify-center text-sm">No events</div>}
              {sortedItems().map((activity, idxActivity) => {
                return (
                  <li key={idxActivity}>
                    <div className="relative pb-8">
                      {items.length > 0 && idxActivity + 1 < items.length && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      )}

                      <div className="relative flex space-x-3">
                        <div>
                          <span className={clsx("h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white")}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="flex-grow">
                          <div className="min-w-0 flex-1 flex justify-between space-x-4">
                            <div className="truncate">
                              <div className="text-sm text-gray-500">
                                <div className="text-gray-900 truncate">
                                  <span title={activity.action}>{activity.action}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500 lowercase truncate">
                              {activity.createdAt && (
                                <time dateTime={DateUtils.dateYMDHMS(activity.createdAt)}>
                                  {dateDM(activity.createdAt)}, {DateUtils.dateHMS(activity.createdAt)}
                                </time>
                              )}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 flex justify-between space-x-4">
                            {activity.user && <div className="font-light text-xs">{activity.user.email}</div>}
                            {activity.apiKey && <div className="font-light text-xs">{activity.apiKey.alias}</div>}
                            {!activity.user && !activity.apiKey && <div className="font-light text-xs">{t("shared.anonymousUser")}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

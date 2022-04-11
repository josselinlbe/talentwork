import { useTranslation } from "react-i18next";
import { json, LoaderFunction, useLoaderData } from "remix";
import UserEventsTable from "~/components/app/events/UserEventsTable";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { getAllUserEvents, UserEventWithDetails } from "~/utils/db/users.db.server";

type LoaderData = {
  items: UserEventWithDetails[];
};

export let loader: LoaderFunction = async ({ params }) => {
  const items = await getAllUserEvents();

  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function Events() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("models.userEvent.plural")}</h1>
          <div className="flex items-center">
            <ButtonSecondary to=".">
              <span>{t("shared.reload")}</span>
            </ButtonSecondary>
          </div>
        </div>
      </div>
      {/* <div className="bg-white border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <Tabs tabs={tabs} className="flex-grow" />
        </div>
      </div> */}
      <div className="pt-2 space-y-2 max-w-5xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserEventsTable withTenant={true} withWorkspace={true} items={data.items} />
      </div>
    </div>
  );
}

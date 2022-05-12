import { useTranslation } from "react-i18next";
import { json, LoaderFunction, useLoaderData } from "remix";
import LogsTable from "~/components/app/events/LogsTable";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { getAllLogs, LogWithDetails } from "~/utils/db/logs.db.server";

type LoaderData = {
  items: LogWithDetails[];
};

export let loader: LoaderFunction = async () => {
  const items = await getAllLogs();

  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function Events() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  return (
    <IndexPageLayout
      title={t("models.log.plural")}
      buttons={
        <ButtonSecondary to=".">
          <span>{t("shared.reload")}</span>
        </ButtonSecondary>
      }
    >
      <LogsTable withTenant={true} items={data.items} />
    </IndexPageLayout>
  );
}

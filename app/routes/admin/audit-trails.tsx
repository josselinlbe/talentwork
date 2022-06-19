import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import LogsTable from "~/components/app/events/LogsTable";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import { getAllLogs, LogWithDetails } from "~/utils/db/logs.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  items: LogWithDetails[];
};

export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.auditTrails.view");
  const { t } = await i18nHelper(request);
  const items = await getAllLogs();

  const data: LoaderData = {
    title: `${t("models.log.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

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

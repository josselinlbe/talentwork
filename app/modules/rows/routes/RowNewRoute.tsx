import { useTranslation } from "react-i18next";
import { useLoaderData, Outlet } from "remix";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import RowForm from "~/components/entities/rows/RowForm";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import { LoaderDataRowNew } from "../loaders/row-new";

interface Props {
  showBreadcrumb?: boolean;
  className?: string;
}
export default function RowNewRoute({ showBreadcrumb = true, className }: Props) {
  const data = useLoaderData<LoaderDataRowNew>();
  const { t } = useTranslation();

  return (
    <NewPageLayout
      className={className}
      title={t("shared.new") + " " + t(data.entity.title)}
      menu={
        showBreadcrumb
          ? [
              { title: t(data.entity.titlePlural), routePath: `${data.entityRowsRoute}` },
              { title: t("shared.new"), routePath: `${data.entityRowsRoute}/new` },
            ]
          : []
      }
    >
      <CheckPlanFeatureLimit item={data.featureUsageEntity}>
        <RowForm entity={data.entity} relatedEntities={data.relatedEntities} linkedAccounts={data.linkedAccounts} />
        <Outlet />
      </CheckPlanFeatureLimit>
    </NewPageLayout>
  );
}

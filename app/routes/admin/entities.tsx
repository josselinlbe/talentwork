import { useTranslation } from "react-i18next";
import { json, LoaderFunction, useLoaderData, useTransition } from "remix";
import EntitiesTable from "~/components/entities/EntitiesTable";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import Loading from "~/components/ui/loaders/Loading";
import { EntityWithCount, getAllEntitiesWithRowCount } from "~/utils/db/entities.db.server";

type LoaderData = {
  items: EntityWithCount[];
};

export let loader: LoaderFunction = async ({ params }) => {
  const items = await getAllEntitiesWithRowCount();

  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function Events() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const transition = useTransition();
  const loading = transition.state === "loading";

  return (
    <IndexPageLayout
      title={t("models.entity.plural")}
      buttons={
        <>
          <ButtonSecondary to=".">
            <span>{t("shared.reload")}</span>
          </ButtonSecondary>
          <ButtonPrimary to="/admin/entities/new">
            <span>{t("shared.new")}</span>
          </ButtonPrimary>
        </>
      }
    >
      {loading ? <Loading /> : <EntitiesTable items={data.items} />}
    </IndexPageLayout>
  );
}

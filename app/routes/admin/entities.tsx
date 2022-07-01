import { useState } from "react";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, useLoaderData, useTransition } from "remix";
import EntitiesTable from "~/components/entities/EntitiesTable";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputSearch from "~/components/ui/input/InputSearch";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import Loading from "~/components/ui/loaders/Loading";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { EntityWithCount, getAllEntitiesWithRowCount } from "~/utils/db/entities/entities.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  title: string;
  items: EntityWithCount[];
};

export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.entities.view");
  const { t } = await i18nHelper(request);
  const items = await getAllEntitiesWithRowCount();

  const data: LoaderData = {
    title: `${t("models.entity.plural")} | ${process.env.APP_NAME}`,
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
  const adminData = useAdminData();
  const transition = useTransition();
  const loading = transition.state === "loading";

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (f) =>
        DateUtils.dateYMDHMS(f.createdAt)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.slug?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.title?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.titlePlural?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        t(f.title)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        t(f.titlePlural)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.properties.find(
          (x) =>
            x.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.title?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            t(x.title)?.toString().toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  return (
    <IndexPageLayout
      title={t("models.entity.plural")}
      buttons={
        <>
          <InputSearch value={searchInput} setValue={setSearchInput} />
          <ButtonPrimary disabled={!adminData.permissions.includes("admin.entities.create")} to="/admin/entities/new">
            <span>{t("shared.new")}</span>
          </ButtonPrimary>
        </>
      }
    >
      {loading ? <Loading /> : <EntitiesTable items={filteredItems()} />}
    </IndexPageLayout>
  );
}

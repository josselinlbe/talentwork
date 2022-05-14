import { useTranslation } from "react-i18next";
import { ActionFunction, LoaderFunction, MetaFunction, redirect, useParams } from "remix";
import { json, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenantUrl } from "~/utils/services/urlService";
import { EntityWithDetails, getEntityById, getEntityBySlug } from "~/utils/db/entities.db.server";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import EntityRowForm from "~/components/entities/EntityRowForm";
import { getUserInfo } from "~/utils/session.server";
import { createEntityRow, EntityRowWithDetails, getEntityRow, getEntityRows } from "~/utils/db/entityRows.db.server";
import EntityRowHelper from "~/utils/helpers/EntityRowHelper";
import { createEntityRowLog } from "~/utils/db/logs.db.server";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import { getEntityProperty } from "~/utils/db/entityProperties.db.server";
import { getRelatedEntityRows } from "~/utils/services/entitiesService";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: EntityRowWithDetails[] }[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }
  const relatedEntities = await getRelatedEntityRows(entity.properties, tenantUrl.tenantId);
  const data: LoaderData = {
    title: `${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    relatedEntities,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  const tenantUrl = await getTenantUrl(params);
  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return badRequest({ error: "Invalid entity: " + params.entity });
  }

  const form = await request.formData();

  try {
    const rowValues = EntityRowHelper.getRowPropertiesFromForm(entity, form);
    const created = await createEntityRow({
      entityId: entity.id,
      tenantId: tenantUrl.tenantId,
      createdByUserId: userInfo.userId,
      linkedAccountId: rowValues.linkedAccountId,
      dynamicProperties: rowValues.dynamicProperties,
      properties: rowValues.properties,
    });
    const item = await getEntityRow(entity.id, created.id, tenantUrl.tenantId);
    await createEntityRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: "Created", entity, item });
    return redirect(`/app/${params.tenant}/${entity.slug}/${created.id}`);
    // return badRequest({ error: JSON.stringify(form) });
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function EntityRowsListRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const params = useParams();

  return (
    <NewPageLayout
      title={t("shared.new") + " " + t(data.entity.title)}
      menu={[
        { title: t(data.entity.titlePlural), routePath: `/app/${params.tenant}/${params.entity}` },
        { title: t("shared.new"), routePath: `/app/${params.tenant}/${params.entity}/new` },
      ]}
    >
      <EntityRowForm entity={data.entity} relatedEntities={data.relatedEntities} />
    </NewPageLayout>
  );
}

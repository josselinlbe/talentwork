import { useTranslation } from "react-i18next";
import { ActionFunction, LoaderFunction, MetaFunction, Outlet, redirect, useParams } from "remix";
import { json, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenantUrl } from "~/utils/services/urlService";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import RowForm from "~/components/entities/rows/RowForm";
import { getUserInfo } from "~/utils/session.server";
import { createRow, RowWithDetails, getRow } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { createRowLog } from "~/utils/db/logs.db.server";
import { getRelatedRows } from "~/utils/services/entitiesService";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }
  const relatedEntities = await getRelatedRows(entity.properties, tenantUrl.tenantId);
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
  const userInfo = await getUserInfo(request);
  const tenantUrl = await getTenantUrl(params);
  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return badRequest({ error: "Invalid entity: " + params.entity });
  }

  const form = await request.formData();

  try {
    const rowValues = RowHelper.getRowPropertiesFromForm(entity, form);
    return badRequest({ error: JSON.stringify(rowValues) });
    const created = await createRow({
      entityId: entity.id,
      tenantId: tenantUrl.tenantId,
      createdByUserId: userInfo.userId,
      linkedAccountId: rowValues.linkedAccountId,
      dynamicProperties: rowValues.dynamicProperties,
      properties: rowValues.properties,
    });
    const item = await getRow(entity.id, created.id, tenantUrl.tenantId);
    await createRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: "Created", entity, item });
    return redirect(`/app/${params.tenant}/${entity.slug}/${created.id}`);
    // return badRequest({ error: JSON.stringify(form) });
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function RowsListRoute() {
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
      <RowForm entity={data.entity} relatedEntities={data.relatedEntities} />
      <Outlet />
    </NewPageLayout>
  );
}

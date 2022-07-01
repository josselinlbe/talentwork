import { ActionFunction, LoaderFunction, MetaFunction, Outlet, redirect, useNavigate, useParams } from "remix";
import { json, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenantUrl } from "~/utils/services/urlService";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import RowForm from "~/components/entities/rows/RowForm";
import { getUserInfo } from "~/utils/session.server";
import { createRow, RowWithDetails, getRow } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { createRowLog } from "~/utils/db/logs.db.server";
import { getRelatedRows } from "~/utils/services/entitiesService";
import OpenModal from "~/components/ui/modals/OpenModal";
import UrlUtils from "~/utils/app/UrlUtils";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const entity = await getEntityBySlug(params.parent ?? "");
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
  const entity = await getEntityBySlug(params.parent ?? "");
  if (!entity) {
    return badRequest({ error: "Invalid entity: " + params.parent });
  }

  const form = await request.formData();

  try {
    const rowValues = RowHelper.getRowPropertiesFromForm(entity, form);
    const created = await createRow({
      entityId: entity.id,
      tenantId: tenantUrl.tenantId,
      createdByUserId: userInfo.userId,
      linkedAccountId: rowValues.linkedAccountId,
      dynamicProperties: rowValues.dynamicProperties,
      properties: rowValues.properties,
    });
    const item = await getRow(entity.id, created.id, tenantUrl.tenantId);
    await createRowLog(request, { tenantId: tenantUrl.tenantId, createdByUserId: userInfo.userId, action: DefaultLogActions.Created, entity, item });
    return redirect(`/app/${params.tenant}/${params.entity}/new?${entity.name}=${created.id}`);
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function RowsListRoute() {
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  const navigate = useNavigate();

  return (
    <OpenModal className="sm:max-w-md" onClose={() => navigate(UrlUtils.currentTenantUrl(params, `${params.entity}/new`))}>
      <RowForm entity={data.entity} relatedEntities={data.relatedEntities} />
      <Outlet />
    </OpenModal>
  );
}

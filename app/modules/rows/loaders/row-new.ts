import { redirect } from "@remix-run/node";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { LinkedAccountWithDetailsAndMembers, getLinksWithMembers } from "~/utils/db/linkedAccounts.db.server";
import { verifyUserHasPermission, getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import { getRelatedRows } from "~/utils/services/entitiesService";
import { getPlanFeatureUsage } from "~/utils/services/subscriptionService";
import { Params } from "react-router";

export type LoaderDataRowNew = {
  title: string;
  entity: EntityWithDetails;
  relatedEntities: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] }[];
  featureUsageEntity: PlanFeatureUsageDto | undefined;
  linkedAccounts: LinkedAccountWithDetailsAndMembers[];
  entityRowsRoute: string;
};
export let loaderRowNew = async (request: Request, params: Params, tenantId: string | null, entitySlug: string, entityRowsRoute: string) => {
  let { t } = await i18nHelper(request);

  const entity = await getEntityBySlug(entitySlug);
  if (!entity) {
    throw redirect(entityRowsRoute);
  }
  await verifyUserHasPermission(request, getEntityPermission(entity, "create"), tenantId);

  const relatedEntities = await getRelatedRows(entity.properties, tenantId);
  const featureUsageEntity = tenantId ? await getPlanFeatureUsage(tenantId, entity.name) : undefined;
  const linkedAccounts = await getLinksWithMembers(tenantId);
  const data: LoaderDataRowNew = {
    title: `${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    relatedEntities,
    featureUsageEntity,
    linkedAccounts,
    entityRowsRoute,
  };
  return data;
};

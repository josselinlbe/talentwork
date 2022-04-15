import { ActionFunction, json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { createTenantRelationship, getTenantRelationshipByTenantIds, getTenantRelationshipsCount } from "~/utils/db/tenantRelationships.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserInfo } from "~/utils/session.server";
import NewTenantRelationship from "~/components/app/tenantRelationships/NewTenantRelationship";
import { createUserEvent, getUserByEmail } from "~/utils/db/users.db.server";
import { TenantRelationshipStatus } from "~/application/enums/tenants/TenantRelationshipStatus";
import { TenantRelationship } from "@prisma/client";
import { getMyTenants } from "~/utils/db/tenants.db.server";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { sendEmail } from "~/utils/email.server";
import { loadAppData } from "~/utils/data/useAppData";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  title: string;
  linksCount: number;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const data: LoaderData = {
    title: `${t("app.tenantRelationships.actions.new")} | ${process.env.APP_NAME}`,
    linksCount: await getTenantRelationshipsCount(tenantUrl.tenantId, [TenantRelationshipStatus.PENDING, TenantRelationshipStatus.LINKED]),
  };
  return json(data);
};

export type NewTenantRelationshipActionData = {
  error?: string;
  success?: string;
  tenantRelationship?: TenantRelationship;
};
const badRequest = (data: NewTenantRelationshipActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const userInfo = await getUserInfo(request);
  const appData = await loadAppData(request, params);

  const form = await request.formData();
  const email = form.get("email")?.toString().toLowerCase().trim() ?? "";
  const tenantName = form.get("tenant-name")?.toString() ?? "";
  const inviteeIsProvider = Boolean(form.get("invitee-is-provider"));
  if (!email || !tenantName) {
    return badRequest({ error: t("shared.missingFields") });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return badRequest({ error: t("api.errors.userNotRegistered") });
  }
  if (user.id === userInfo.userId) {
    return badRequest({ error: t("app.tenantRelationships.invitation.cannotInviteSelf") });
  }

  const tenants = await getMyTenants(user.id);
  const tenantMember = tenants.find((f) => f.tenant.name === tenantName);
  if (!tenantMember) {
    return badRequest({
      error: t("app.tenantRelationships.invitation.notFound", [email, tenantName]),
    });
  }
  if (tenantMember.tenantId === tenantUrl.tenantId) {
    return badRequest({ error: t("app.tenantRelationships.invitation.cannotInviteCurrentTenant") });
  }
  if (!tenantMember || (tenantMember.role !== TenantUserRole.OWNER && tenantMember.role !== TenantUserRole.ADMIN)) {
    return badRequest({ error: t("app.tenantRelationships.invitation.inviteOwnersOrAdmins") });
  }

  const providerTenantId = inviteeIsProvider ? tenantMember.tenantId : tenantUrl.tenantId;
  const clientTenantId = !inviteeIsProvider ? tenantMember.tenantId : tenantUrl.tenantId;
  const existing = await getTenantRelationshipByTenantIds(providerTenantId, clientTenantId);
  if (existing) {
    return badRequest({ error: t("app.tenantRelationships.invitation.existing") });
  }

  const tenantRelationship = await createTenantRelationship({
    createdByUserId: userInfo.userId,
    createdByTenantId: tenantUrl.tenantId,
    providerTenantId,
    clientTenantId,
    status: TenantRelationshipStatus.PENDING,
    userInvitedId: user.id,
  });

  if (!tenantRelationship) {
    return badRequest({ error: "Could not create link" });
  }

  await sendEmail(user.email, "invite-user-to-link-tenant", {
    action_url: process.env.SERVER_URL + `/app/${tenantMember.tenant.slug}/settings/tenant-relationships`,
    name: user.firstName,
    invite_sender_name: appData.user?.firstName,
    invite_sender_email: appData.user?.email,
    tenant_invitee: tenantName,
    tenant_creator: appData.currentTenant?.name,
    invitation_role: inviteeIsProvider ? "as a provider" : "as a client",
  });

  await createUserEvent(request, tenantUrl, "Created link", `${tenantName} ${inviteeIsProvider ? "as a provider" : "as a client"}`);

  const data: NewTenantRelationshipActionData = {
    tenantRelationship,
    success: t("app.tenantRelationships.pending.invitationSentDescription", [email]),
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function NewTenantRelationshipRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <div className="lg:py-8 max-w-2xl mx-auto">
        <div>
          <NewTenantRelationship linksCount={data.linksCount} />
        </div>
      </div>
    </div>
  );
}

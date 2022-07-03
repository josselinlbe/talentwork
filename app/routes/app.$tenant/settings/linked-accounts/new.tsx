import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserInfo } from "~/utils/session.server";
import { getUserByEmail } from "~/utils/db/users.db.server";
import { getMyTenants } from "~/utils/db/tenants.db.server";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { sendEmail } from "~/utils/email.server";
import { loadAppData } from "~/utils/data/useAppData";
import { getTenantUrl } from "~/utils/services/urlService";
import { createLog } from "~/utils/db/logs.db.server";
import NewLinkedAccount from "~/components/app/linkedAccounts/NewLinkedAccount";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { createLinkedAccount, getLinkedAccountByTenantIds, getLinkedAccountsCount } from "~/utils/db/linkedAccounts.db.server";
import { LinkedAccount } from "@prisma/client";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  linksCount: number;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.settings.linkedAccounts.create", tenantUrl.tenantId);

  const data: LoaderData = {
    title: `${t("app.linkedAccounts.actions.new")} | ${process.env.APP_NAME}`,
    linksCount: await getLinkedAccountsCount(tenantUrl.tenantId, [LinkedAccountStatus.PENDING, LinkedAccountStatus.LINKED]),
  };
  return json(data);
};

export type NewLinkedAccountActionData = {
  error?: string;
  success?: string;
  linkedAccount?: LinkedAccount;
};
const badRequest = (data: NewLinkedAccountActionData) => json(data, { status: 400 });
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
    return badRequest({ error: t("app.linkedAccounts.invitation.cannotInviteSelf") });
  }

  const tenants = await getMyTenants(user.id);
  const tenantMember = tenants.find((f) => f.tenant.name === tenantName);
  if (!tenantMember) {
    return badRequest({
      error: t("app.linkedAccounts.invitation.notFound", [email, tenantName]),
    });
  }
  if (tenantMember.tenantId === tenantUrl.tenantId) {
    return badRequest({ error: t("app.linkedAccounts.invitation.cannotInviteCurrentTenant") });
  }
  if (!tenantMember || (tenantMember.type !== TenantUserType.OWNER && tenantMember.type !== TenantUserType.ADMIN)) {
    return badRequest({ error: t("app.linkedAccounts.invitation.inviteOwnersOrAdmins") });
  }

  const providerTenantId = inviteeIsProvider ? tenantMember.tenantId : tenantUrl.tenantId;
  const clientTenantId = !inviteeIsProvider ? tenantMember.tenantId : tenantUrl.tenantId;
  const existing = await getLinkedAccountByTenantIds(providerTenantId, clientTenantId);
  if (existing) {
    return badRequest({ error: t("app.linkedAccounts.invitation.existing") });
  }

  const linkedAccount = await createLinkedAccount({
    createdByUserId: userInfo.userId,
    createdByTenantId: tenantUrl.tenantId,
    providerTenantId,
    clientTenantId,
    status: LinkedAccountStatus.PENDING,
    // userInvitedId: user.id,
  });

  if (!linkedAccount) {
    return badRequest({ error: "Could not create link" });
  }

  await createLog(request, tenantUrl, "Created tenant relationship", `${tenantName} ${inviteeIsProvider ? "as a provider" : "as a client"}`);

  try {
    await sendEmail(user.email, "create-linked-account", {
      action_url: process.env.SERVER_URL + `/app/${tenantMember.tenant.slug}/settings/linked-accounts`,
      name: user.firstName,
      invite_sender_name: appData.user?.firstName,
      invite_sender_email: appData.user?.email,
      tenant_invitee: tenantName,
      tenant_creator: appData.currentTenant?.name,
      invitation_role: inviteeIsProvider ? "as a provider" : "as a client",
    });
  } catch (e) {
    return badRequest({ error: "Link created, but could not send email: " + e });
  }

  const data: NewLinkedAccountActionData = {
    linkedAccount,
    success: t("app.linkedAccounts.pending.invitationSentDescription", [email]),
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function NewLinkedAccountRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <div className="lg:py-8 max-w-2xl mx-auto">
        <div>
          <NewLinkedAccount linksCount={data.linksCount} />
        </div>
      </div>
    </div>
  );
}

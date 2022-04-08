import { loadAppData } from "~/utils/data/useAppData";
import { Workspace } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, MetaFunction } from "remix";
import { getWorkspaces } from "~/utils/db/workspaces.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { getTenantMember } from "~/utils/db/tenants.db.server";
import { getUserByEmail } from "~/utils/db/users.db.server";
import { createUserInvitation } from "~/utils/db/tenantUserInvitations.db.server";
import { sendEmail } from "~/utils/email.server";
import NewMember from "~/components/core/settings/members/NewMember";
import { getTenantUrl } from "~/utils/services/urlService";

export type NewMemberLoaderData = {
  title: string;
  tenantWorkspaces: Workspace[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const tenantWorkspaces = await getWorkspaces(tenantUrl.tenantId);
  const data: NewMemberLoaderData = {
    title: `${t("settings.members.actions.new")} | ${process.env.APP_NAME}`,
    tenantWorkspaces: tenantWorkspaces ?? [],
  };
  return json(data);
};

export type NewMemberActionData = {
  error?: string;
  success?: string;
  fields?: {
    email: string;
    firstName: string;
    lastName: string;
    role: number;
    workspaces: string[];
  };
};

const badRequest = (data: NewMemberActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const appData = await loadAppData(request, params);

  const form = await request.formData();
  const email = form.get("email")?.toString().toLowerCase().trim() ?? "";
  const firstName = form.get("first-name")?.toString() ?? "";
  const lastName = form.get("last-name")?.toString() ?? "";
  const role = Number(form.get("tenant-user-role"));
  const workspaces = form.getAll("workspaces[]").map((f) => f.toString());

  if (workspaces.length === 0) {
    return badRequest({
      error: t("account.tenant.members.errors.atLeastOneWorkspace"),
    });
  }

  const user = await getUserByEmail(email);
  if (user) {
    const tenantUser = await getTenantMember(user.id, tenantUrl.tenantId);
    if (tenantUser) {
      return badRequest({
        error: "User already in organization",
      });
    }
  }

  const invitation = await createUserInvitation(tenantUrl.tenantId, workspaces, {
    email,
    firstName,
    lastName,
    role,
  });
  if (!invitation) {
    return badRequest({
      error: "Could not create invitation",
    });
  }

  await sendEmail(email, "user-invitation", {
    name: firstName,
    invite_sender_name: appData.user?.firstName,
    invite_sender_organization: appData.currentTenant?.name,
    action_url: process.env.SERVER_URL + `/invitation/${invitation.id}`,
  });

  return json({
    success: "Invitation sent",
  });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function NewMemberRoute() {
  return <NewMember />;
}

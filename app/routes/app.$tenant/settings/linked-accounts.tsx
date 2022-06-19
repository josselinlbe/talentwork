import { ActionFunction, json, LoaderFunction, MetaFunction, Outlet, redirect, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { useState } from "react";
import UrlUtils from "~/utils/app/UrlUtils";
import LinkedAccountsTable from "~/components/app/linkedAccounts/LinkedAccountsTable";
import { getLinkedAccounts, getLinkedAccount, updateLinkedAccount, deleteLinkedAccount, LinkedAccountWithDetails } from "~/utils/db/linkedAccounts.db.server";
import { getTenantUrl } from "~/utils/services/urlService";
import { loadAppData, useAppData } from "~/utils/data/useAppData";
import { getUser } from "~/utils/db/users.db.server";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { sendEmail } from "~/utils/email.server";
import InputSearch from "~/components/ui/input/InputSearch";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
type LoaderData = {
  title: string;
  items: LinkedAccountWithDetails[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.settings.linkedAccounts.view", tenantUrl.tenantId);

  const items = await getLinkedAccounts(tenantUrl.tenantId);
  const data: LoaderData = {
    title: `${t("models.linkedAccount.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  items?: LinkedAccountWithDetails[];
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const appData = await loadAppData(request, params);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  const linkedAccountId = form.get("linked-account-id")?.toString();
  if (!linkedAccountId) {
    return badRequest({ error: "Invalid tenant relationship" });
  }
  const existing = await getLinkedAccount(linkedAccountId);
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  if (action === "delete") {
    await deleteLinkedAccount(existing.id);
    return redirect(UrlUtils.currentTenantUrl(params, "settings/linked-accounts"));
  } else if (action === "update-status") {
    const accepted = form.get("accepted")?.toString() === "true";
    const user = await getUser(existing?.createdByUserId);
    if (!user) {
      return badRequest({
        error: "Invalid user",
      });
    }

    await updateLinkedAccount(linkedAccountId, {
      status: accepted ? LinkedAccountStatus.LINKED : LinkedAccountStatus.REJECTED,
    });

    const relatedTenant = existing.providerTenantId === appData.currentTenant.id ? existing.clientTenant : existing.providerTenant;
    if (accepted) {
      await sendEmail(user.email, "linked-account-accepted", {
        action_url: process.env.SERVER_URL + `/app/${relatedTenant.slug}/settings/linked-accounts`,
        name: user.firstName,
        user_invitee_name: appData.user?.firstName,
        user_invitee_email: appData.user?.email,
        tenant_invitee: appData.currentTenant?.name,
        action_text: "View tenant relationships",
      });
    } else {
      await sendEmail(user.email, "linked-account-rejected", {
        action_url: process.env.SERVER_URL + `/app/${relatedTenant.slug}/settings/linked-accounts`,
        name: user.firstName,
        email: appData.user?.email,
        tenant: appData.currentTenant?.name,
        action_text: "View tenant relationships",
      });
    }

    const tenantUrl = await getTenantUrl(params);
    return json({
      items: await getLinkedAccounts(tenantUrl.tenantId, LinkedAccountStatus.PENDING),
    });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function LinkedAccountsRoute() {
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (f) =>
        f.clientTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.providerTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  return (
    <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
      <div>
        <div>
          <div className="space-y-2">
            <InputSearch
              value={searchInput}
              setValue={setSearchInput}
              onNewRoute={appData.permissions.includes("app.settings.linkedAccounts.create") ? "new" : ""}
            />
            <LinkedAccountsTable items={filteredItems()} canDelete={appData.permissions.includes("app.settings.linkedAccounts.delete")} />
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

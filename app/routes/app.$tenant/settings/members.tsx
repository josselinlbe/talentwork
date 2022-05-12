import { useTranslation } from "react-i18next";
import MembersListAndTable from "~/components/core/settings/members/MembersListAndTable";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useRef, useState } from "react";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { getTenantUsers, TenantUserWithUser } from "~/utils/db/tenants.db.server";
import { ActionFunction, json, Link, LoaderFunction, MetaFunction, Outlet, useLoaderData, useNavigate, useParams } from "remix";
import { useAppData } from "~/utils/data/useAppData";
import { deleteUserInvitation, getUserInvitation, getUserInvitations } from "~/utils/db/tenantUserInvitations.db.server";
import MemberInvitationsListAndTable from "~/components/core/settings/members/MemberInvitationsListAndTable";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";
import { requireOwnerOrAdminRole } from "~/utils/loaders.middleware";
import InputSearch from "~/components/ui/input/InputSearch";

type LoaderData = {
  title: string;
  users: TenantUserWithUser[];
  pendingInvitations: Awaited<ReturnType<typeof getUserInvitations>>;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  await requireOwnerOrAdminRole(request, params);
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const users = await getTenantUsers(tenantUrl.tenantId);
  const pendingInvitations = await getUserInvitations(tenantUrl.tenantId);
  const data: LoaderData = {
    title: `${t("settings.members.title")} | ${process.env.APP_NAME}`,
    users,
    pendingInvitations,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "delete-invitation") {
    const invitationId = form.get("invitation-id")?.toString() ?? "";
    const invitation = await getUserInvitation(invitationId);
    if (!invitation) {
      return badRequest({
        error: "Invitation not found",
      });
    }
    await deleteUserInvitation(invitation.id);
    return json({ success: "Invitation deleted" });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function MembersRoute() {
  const params = useParams();
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const errorModal = useRef<RefErrorModal>(null);
  const confirmUpgrade = useRef<RefConfirmModal>(null);

  const [searchInput, setSearchInput] = useState("");

  function yesUpdateSubscription() {
    navigate(UrlUtils.currentTenantUrl(params, `settings/subscription`));
  }

  const maxUsers = (): number => {
    if (appData.user?.admin !== null) {
      return 0;
    }
    return appData.mySubscription?.subscriptionPrice?.subscriptionProduct.maxUsers ?? 0;
  };
  const maxUsersReached = () => {
    return maxUsers() > 0 && (data.users?.length ?? 0) >= maxUsers();
  };
  const filteredItems = () => {
    if (!data.users) {
      return [];
    }
    return data.users.filter(
      (f) =>
        f.user.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.phone?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };
  const sortedItems = () => {
    if (!data.users) {
      return [];
    }
    const filtered = filteredItems()
      .slice()
      .sort((x, y) => {
        return x.role > y.role ? -1 : 1;
      });
    return filtered.sort((x, y) => {
      return x.role > y.role ? 1 : -1;
    });
  };

  return (
    <div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <div className="space-y-2">
            <InputSearch value={searchInput} setValue={setSearchInput} onNew={() => navigate(UrlUtils.currentTenantUrl(params, "settings/members/new"))} />
            <div>
              <MembersListAndTable items={sortedItems()} />

              {data.pendingInvitations.length > 0 && <MemberInvitationsListAndTable items={data.pendingInvitations} />}

              {maxUsersReached() && (
                <div>
                  <WarningBanner title={t("app.subscription.errors.limitReached")} text={t("app.subscription.errors.limitReachedUsers", [maxUsers])} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmUpgrade} onYes={yesUpdateSubscription} />
      <Outlet />
    </div>
  );
}

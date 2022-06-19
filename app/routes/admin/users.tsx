import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { ActionFunction, json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { adminGetAllTenantUsers, adminGetAllUsers, getUser, updateUserPassword, UserWithDetails } from "~/utils/db/users.db.server";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { Tenant } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getTenant } from "~/utils/db/tenants.db.server";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import UsersTable from "~/components/core/users/UsersTable";
import { deleteUserWithItsTenants } from "~/utils/services/userService";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAdminData } from "~/utils/data/useAdminData";

type LoaderData = {
  title: string;
  items: UserWithDetails[];
  tenant: Tenant | null;
};

export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.users.view");
  let { t } = await i18nHelper(request);

  const tenantId = new URL(request.url).searchParams.get("tenant");
  const items = tenantId ? await adminGetAllTenantUsers(tenantId) : await adminGetAllUsers();

  const data: LoaderData = {
    title: `${t("models.user.plural")} | ${process.env.APP_NAME}`,
    items,
    tenant: tenantId ? await getTenant(tenantId) : null,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export enum UsersActionType {
  Impersonate = "impersonate",
  ChangePassword = "change-password",
  DeleteUser = "delete-user",
}
export type UsersActionData = {
  error?: string;
  success?: string;
};
const success = (data: UsersActionData) => json(data, { status: 200 });
const badRequest = (data: UsersActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  let { t } = await i18nHelper(request);

  const form = await request.formData();
  const action: UsersActionType = form.get("action")?.toString() as UsersActionType;
  const userId = form.get("user-id")?.toString();
  const user = await getUser(userId);

  if (!userId || !user || !action) {
    return badRequest({ error: "Form not submitted correctly." });
  }
  switch (action) {
    case UsersActionType.Impersonate: {
      const userSession = await setLoggedUser(user);
      if (!userSession) {
        return badRequest({
          error: t("shared.notFound"),
        });
      }
      return createUserSession(
        {
          ...userInfo,
          ...userSession,
        },
        userSession.defaultTenantId ? `/app/${userSession.defaultTenantId}/dashboard` : "/app"
      );
    }
    case UsersActionType.ChangePassword: {
      const passwordNew = form.get("password-new")?.toString();
      if (!passwordNew || passwordNew.length < 8) {
        return badRequest({ error: "Set a password with 8 characters minimum" });
      } else if (user?.admin) {
        return badRequest({ error: "You cannot change password for admin user" });
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10);
      await updateUserPassword({ passwordHash }, user?.id);

      return success({ success: t("shared.updated") });
    }
    case UsersActionType.DeleteUser: {
      // TODO: CANCEL TENANTS SUBSCRIPTIONS, DELETE TENANTS AND SUBSCRIPTIONS
      try {
        await deleteUserWithItsTenants(userId);
      } catch (e: any) {
        return badRequest({
          error: e,
        });
      }
      return success({ success: t("shared.deleted") });
    }
    default: {
      return badRequest({ error: "Form not submitted correctly." });
    }
  }
};

export default function AdminUsersRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  const { t } = useTranslation();

  return (
    <div>
      {data.tenant && (
        <Breadcrumb
          className="w-full"
          home="/admin/dashboard"
          menu={[
            { title: t("models.tenant.plural"), routePath: "/admin/accounts" },
            { title: data.tenant.name, routePath: `/admin/tenant/${data.tenant.id}/profile` },
            { title: t("models.user.plural"), routePath: "" },
          ]}
        />
      )}
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">
            {t("models.user.plural")}
            {/* {!loading && (
              <span className="ml-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-800 border border-gray-300">
                {filteredItems().length}
              </span>
            )} */}
          </h1>
          <div className="flex items-center space-x-2 h-9">
            <ButtonSecondary to="." type="button">
              {t("shared.reload")}
            </ButtonSecondary>
          </div>
        </div>
      </div>

      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        <UsersTable
          items={data.items}
          canImpersonate={adminData.permissions.includes("admin.users.impersonate")}
          canChangePassword={adminData.permissions.includes("admin.users.changePassword")}
          canDelete={adminData.permissions.includes("admin.users.delete")}
        />
      </div>
    </div>
  );
}

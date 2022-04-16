import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { ActionFunction, json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { adminGetAllTenantUsers, adminGetAllUsers, deleteUser, getUser, updateUserPassword } from "~/utils/db/users.db.server";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { Tenant } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getTenant } from "~/utils/db/tenants.db.server";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import UsersTable from "~/components/core/users/UsersTable";

type LoaderData = {
  title: string;
  items: Awaited<ReturnType<typeof adminGetAllUsers>>;
  tenant: Tenant | null;
};

export let loader: LoaderFunction = async ({ request }) => {
  // await new Promise((r) => setTimeout(r, 4000));
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
  const type: UsersActionType = form.get("type")?.toString() as UsersActionType;
  const userId = form.get("user-id")?.toString();
  const user = await getUser(userId);

  if (!userId || !user || !type) {
    return badRequest({ error: "Form not submitted correctly." });
  }
  switch (type) {
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
      await deleteUser(userId);
      return success({ success: t("shared.deleted") });
    }
    default: {
      return badRequest({ error: "Form not submitted correctly." });
    }
  }
};

export default function AdminUsersRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <div>
      {data.tenant && (
        <Breadcrumb
          className="w-full"
          home="/admin"
          menu={[
            { title: t("models.tenant.plural"), routePath: "/admin/tenants" },
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

      <UsersTable items={data.items} />
    </div>
  );
}

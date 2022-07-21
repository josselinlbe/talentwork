import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { adminGetAllUsers, getUser, updateUserPassword, UserWithDetails } from "~/utils/db/users.db.server";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { i18nHelper } from "~/locale/i18n.utils";
import bcrypt from "bcryptjs";
import UsersTable from "~/components/core/users/UsersTable";
import { deleteUserWithItsTenants } from "~/utils/services/userService";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAdminData } from "~/utils/data/useAdminData";
import InputFilters from "~/components/ui/input/InputFilters";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";

type LoaderData = {
  title: string;
  items: UserWithDetails[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.users.view");
  let { t } = await i18nHelper(request);

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "email", title: "models.user.email" },
    { name: "firstName", title: "models.user.firstName" },
    { name: "lastName", title: "models.user.lastName" },
    {
      name: "tenantId",
      title: "models.tenant.object",
      manual: true,
      options: (await adminGetAllTenants()).map((tenant) => {
        return {
          value: tenant.id,
          name: tenant.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const currentPagination = getPaginationFromCurrentUrl(request);
  const { items, pagination } = await adminGetAllUsers(filters, currentPagination);

  const data: LoaderData = {
    title: `${t("models.user.plural")} | ${process.env.APP_NAME}`,
    items: items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
    filterableProperties,
    pagination,
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
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("models.user.plural")}</h1>
          <div className="flex items-center space-x-2 h-9">
            <InputFilters filters={data.filterableProperties} />
          </div>
        </div>
      </div>

      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        <UsersTable
          items={data.items}
          canImpersonate={adminData.permissions.includes("admin.users.impersonate")}
          canChangePassword={adminData.permissions.includes("admin.users.changePassword")}
          canDelete={adminData.permissions.includes("admin.users.delete")}
          pagination={data.pagination}
        />
      </div>
    </div>
  );
}

import { User } from "@prisma/client";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSubmit } from "@remix-run/react";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { UsersActionType } from "~/routes/admin/users";
import { UserWithDetails } from "~/utils/db/users.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import UserBadge from "./UserBadge";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";

interface Props {
  items: UserWithDetails[];
  canImpersonate: boolean;
  canChangePassword: boolean;
  canDelete: boolean;
  pagination: PaginationDto;
}
export default function UsersTable({ items, canImpersonate, canChangePassword, canDelete, pagination }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const headers: RowHeaderDisplayDto<UserWithDetails>[] = [
    {
      name: "user",
      title: t("models.user.object"),
      value: (i) => i.email,
      formattedValue: (item) => <UserBadge item={item} admin={item.admin} withAvatar={true} />,
    },
    {
      name: "tenants",
      title: t("models.user.tenants"),
      value: (i) => getUserTenants(i),
    },
    {
      name: "createdAt",
      title: t("shared.createdAt"),
      value: (i) => DateUtils.dateDM(i.createdAt),
      formattedValue: (item) => (
        <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
          {DateUtils.dateAgo(item.createdAt)}
        </time>
      ),
    },
  ];

  function impersonate(user: UserWithDetails) {
    const form = new FormData();
    form.set("action", UsersActionType.Impersonate);
    form.set("user-id", user.id);
    submit(form, {
      action: "/admin/users",
      method: "post",
    });
  }
  function changePassword(user: UserWithDetails) {
    const password = prompt(t("settings.profile.changePassword") + " - " + user.email);
    if (password && confirm("[ADMINISTRATOR] Update password for user " + user.email + "?")) {
      const form = new FormData();
      form.set("action", UsersActionType.ChangePassword);
      form.set("user-id", user.id);
      form.set("password-new", password);
      submit(form, {
        action: "/admin/users",
        method: "post",
      });
    }
  }
  function getUserTenants(user: UserWithDetails) {
    return user.tenants.map((f) => `${f.tenant?.name} (${t("settings.profile.types." + TenantUserType[f.type])})`).join(", ");
  }
  function deleteUser(item: UserWithDetails) {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(item);
      confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("admin.users.deleteWarning"));
    }
  }
  function confirmDeleteUser(item: User) {
    const form = new FormData();
    form.set("action", UsersActionType.DeleteUser);
    form.set("user-id", item.id);
    submit(form, {
      action: "/admin/users",
      method: "post",
    });
  }

  return (
    <div>
      <TableSimple
        items={items}
        headers={headers}
        actions={[
          {
            title: t("models.user.impersonate"),
            onClick: (_, item) => impersonate(item),
            disabled: !canImpersonate,
          },
          {
            title: t("settings.profile.changePassword"),
            onClick: (_, item) => changePassword(item),
            disabled: !canChangePassword,
          },
          {
            title: t("shared.delete"),
            onClick: (_, item) => deleteUser(item),
            disabled: !canDelete,
            destructive: true,
          },
        ]}
        pagination={pagination}
      />
      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteUser} />
    </div>
  );
}

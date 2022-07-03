import { AdminUser, User } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { UserWithDetails } from "~/utils/db/users.db.server";
import UserAvatarBadge from "./UserAvatarBadge";

interface Props {
  item: User | UserWithDetails;
  admin?: AdminUser | null;
  withEmail?: boolean;
  withAvatar?: boolean;
}
export default function UserBadge({ item, admin, withEmail = true, withAvatar }: Props) {
  const { t } = useTranslation();
  return (
    <>
      {!withAvatar ? (
        <div>
          {item.firstName} {item.lastName} {withEmail && <span className="italic text-xs font-normal text-gray-500">({item.email})</span>}
        </div>
      ) : (
        <div className="flex items-center">
          <UserAvatarBadge item={item} />
          <div className="ml-3 truncate">
            <div className="font-medium text-gray-900 truncate">
              {item.firstName} {item.lastName} {admin && <span className="text-xs text-theme-500">({t("shared.admin")})</span>}
            </div>
            <div className="text-gray-500 truncate">{item.email}</div>
          </div>
        </div>
      )}
    </>
  );
}

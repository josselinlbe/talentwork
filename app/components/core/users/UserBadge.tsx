import { AdminUser } from "@prisma/client";
import { useTranslation } from "react-i18next";
import UserAvatarBadge from "./UserAvatarBadge";

interface Props {
  item: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
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
          {item.avatar && <UserAvatarBadge avatar={item.avatar} />}
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

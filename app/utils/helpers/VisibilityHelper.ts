import { TFunction } from "i18next";
import { Visibility } from "~/application/dtos/shared/Visibility";

function getVisibilityTitle(t: TFunction, visibility: string) {
  switch (visibility) {
    case Visibility.Private:
      return t("shared.private");
    case Visibility.Tenant:
      return "Everyone on the account";
    case Visibility.Roles:
      return "Specific roles";
    case Visibility.Groups:
      return "Specific groups";
    case Visibility.Users:
      return "Specific users";
    case Visibility.Public:
      return t("shared.public");
    default:
      return "";
  }
}

export default { getVisibilityTitle };

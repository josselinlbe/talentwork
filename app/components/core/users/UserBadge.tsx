import { User } from "@prisma/client";
import { UserWithDetails } from "~/utils/db/users.db.server";

interface Props {
  item: User | UserWithDetails;
  withEmail?: boolean;
}
export default function UserBadge({ item, withEmail = true }: Props) {
  return (
    <div>
      {item.firstName} {item.lastName} {withEmail && <span className="italic text-xs font-normal text-gray-500">({item.email})</span>}
    </div>
  );
}

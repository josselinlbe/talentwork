import { DealStatus } from "~/application/dtos/crm/DealStatus";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";

interface Props {
  status: string;
}
export default function DealStatusBadge({ status }: Props) {
  return (
    <>
      {DealStatus.Open === status && (
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <ColorBadge color={Colors.YELLOW} />
          <div>Open</div>
        </div>
      )}
      {DealStatus.Won === status && (
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <ColorBadge color={Colors.GREEN} />
          <div>Won</div>
        </div>
      )}
      {DealStatus.Lost === status && (
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <ColorBadge color={Colors.RED} />
          <div>Lost</div>
        </div>
      )}
    </>
  );
}

import { EntityWorkflowState } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { WorkflowInternalState } from "~/application/dtos/workflows/WorkflowInternalState";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import WorkflowHelper from "~/utils/helpers/WorkflowHelper";

interface Props {
  status: WorkflowInternalState;
}
export default function WorkflowInternalStatusBadge({ status }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center space-x-2 text-sm font-medium">
      <ColorBadge color={WorkflowHelper.getWorkflowInternalStatusColor(status)} />
      {/* <div>{t(WorkflowHelper.getWorkflowInternalStatusTitle(status))}</div> */}
    </div>
  );
}

import { WorkflowState } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { DealStatus } from "~/application/dtos/crm/DealStatus";
import { Visibility } from "~/application/dtos/shared/Visibility";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import { WorkflowStateWithSteps } from "~/utils/db/workflows/workflowStates.db.server";
import { WorkflowStepWithDetails } from "~/utils/db/workflows/workflowSteps.db.server";
import WorkflowHelper from "~/utils/helpers/WorkflowHelper";

interface Props {
  step: WorkflowStepWithDetails;
}
export default function WorkflowStepAssignTo({ step }: Props) {
  const { t } = useTranslation();
  function assignees() {
    return WorkflowHelper.getWorkflowStepAssignToItems(step);
  }
  return (
    <div className="flex flex-col text-sm font-medium text-gray-700">
      <div className={clsx(step.assignTo === Visibility.Private && "text-gray-400")}>{WorkflowHelper.getWorkflowStepAssignToTitle(t, step.assignTo)}</div>
      <div className="truncate flex items-center space-x-1">
        {assignees().map((item, idx) => {
          return (
            <div key={idx}>
              {item} {idx !== assignees().length - 1 && ", "}
            </div>
          );
        })}
      </div>
    </div>
  );
}

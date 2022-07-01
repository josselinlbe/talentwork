import { TFunction } from "react-i18next";
import { Visibility } from "~/application/dtos/shared/Visibility";
import { WorkflowInternalState } from "~/application/dtos/workflows/WorkflowInternalState";
import { Colors } from "~/application/enums/shared/Colors";
import { EntityWorkflowStepWithDetails } from "../db/workflows/workflowSteps.db.server";

function getWorkflowInternalStatusColor(status: WorkflowInternalState) {
  switch (status) {
    case WorkflowInternalState.Draft:
      return Colors.GRAY;
    case WorkflowInternalState.Pending:
      return Colors.YELLOW;
    case WorkflowInternalState.Completed:
      return Colors.GREEN;
    case WorkflowInternalState.Cancelled:
      return Colors.RED;
    default:
      return Colors.GRAY;
  }
}

function getWorkflowStepAssignToTitle(t: TFunction, assignTo: string) {
  switch (assignTo) {
    case Visibility.Private:
      return t("models.workflowStep.creator");
    case Visibility.Tenant:
      return t("models.tenant.object");
    case Visibility.Roles:
      return t("models.role.object");
    case Visibility.Groups:
      return t("models.group.object");
    case Visibility.Users:
      return t("models.user.object");
    default:
      return "";
  }
}

function getWorkflowStepAssignToItems(step: EntityWorkflowStepWithDetails): string[] {
  switch (step.assignTo) {
    case Visibility.Private:
      return [""];
    case Visibility.Tenant:
      return step.assignees.map((f) => f.tenant?.name ?? "") ?? [];
    case Visibility.Roles:
      return step.assignees.map((f) => f.role?.name ?? "");
    case Visibility.Groups:
      return step.assignees.map((f) => f.group?.name ?? "");
    case Visibility.Users:
      return step.assignees.map((f) => `${f.user?.firstName} ${f.user?.lastName} (${f.user?.email})`);
    default:
      return [""];
  }
}

export default {
  getWorkflowInternalStatusColor,
  getWorkflowStepAssignToTitle,
  getWorkflowStepAssignToItems,
};

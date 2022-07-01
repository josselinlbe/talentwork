import { EntityWorkflowState } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Visibility } from "~/application/dtos/shared/Visibility";
import WorkflowStateBadge from "~/components/core/workflows/WorkflowStateBadge";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import { EntityWorkflowStepWithDetails } from "~/utils/db/workflows/workflowSteps.db.server";
import WorkflowHelper from "~/utils/helpers/WorkflowHelper";

interface Props {
  states: EntityWorkflowState[];
  item?: EntityWorkflowStepWithDetails;
}

export default function EntityWorkflowStepForm({ states, item }: Props) {
  const { t } = useTranslation();
  return (
    <FormGroup id={item?.id} editing={true}>
      <h3 className="font-bold text-sm">{item ? "Edit Workflow Step" : "New Workflow Step"}</h3>
      <div className="grid grid-cols-12 gap-2">
        <InputSelector
          className="col-span-12"
          name="from-state-id"
          title="From state"
          withSearch={false}
          value={item?.fromStateId}
          options={states.map((item) => {
            return {
              name: <WorkflowStateBadge state={item} />,
              value: item.id,
            };
          })}
          required
        />
        <InputSelector
          className="col-span-12"
          name="to-state-id"
          title="To state"
          withSearch={false}
          value={item?.toStateId}
          options={states.map((item) => {
            return {
              name: <WorkflowStateBadge state={item} />,
              value: item.id,
            };
          })}
          required
        />
        <InputText className="col-span-12" name="action-title" title="Action" value={item?.action} required autoComplete="off" />

        <InputSelector
          className="col-span-12"
          name="assign-to"
          title="Assign to"
          selectPlaceholder="Under construction"
          withSearch={false}
          disabled
          options={[
            {
              name: WorkflowHelper.getWorkflowStepAssignToTitle(t, Visibility.Private),
              value: Visibility.Private,
            },
            {
              name: WorkflowHelper.getWorkflowStepAssignToTitle(t, Visibility.Tenant),
              value: Visibility.Tenant,
            },
            {
              name: WorkflowHelper.getWorkflowStepAssignToTitle(t, Visibility.Roles),
              value: Visibility.Roles,
            },
            {
              name: WorkflowHelper.getWorkflowStepAssignToTitle(t, Visibility.Groups),
              value: Visibility.Groups,
            },
            {
              name: WorkflowHelper.getWorkflowStepAssignToTitle(t, Visibility.Users),
              value: Visibility.Users,
            },
          ]}
          required
        />
      </div>
    </FormGroup>
  );
}

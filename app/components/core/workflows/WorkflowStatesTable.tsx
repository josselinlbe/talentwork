import { useTranslation } from "react-i18next";
import RowOrderButtons from "~/components/entities/rows/RowOrderButtons";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { EntityWorkflowStateWithSteps } from "~/utils/db/workflows/workflowStates.db.server";
import WorkflowInternalStatusBadge from "./WorkflowInternalStatusBadge";
import WorkflowStateBadge from "./WorkflowStateBadge";

interface Props {
  items: EntityWorkflowStateWithSteps[];
}
export default function WorkflowStatesTable({ items }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <TableSimple
        items={items}
        headers={[
          {
            title: t("shared.order"),
            name: "order",
            value: (item) => item.order,
            formattedValue: (_, idx) => <RowOrderButtons index={idx} items={items} />,
          },
          {
            title: t("models.workflowState.title"),
            name: "title",
            value: (item) => item.title,
            formattedValue: (item) => <WorkflowStateBadge state={item} withName={true} />,
            className: "w-full",
          },
          {
            title: t("models.workflowState.canUpdate"),
            name: "canUpdate",
            value: (item) => <span>{item.canUpdate ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-400" />}</span>,
          },
          {
            title: t("models.workflowState.canDelete"),
            name: "canDelete",
            value: (item) => <span>{item.canDelete ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-400" />}</span>,
          },
        ]}
        actions={[
          {
            title: t("shared.edit"),
            onClickRoute: (idx, item) => item.id,
          },
        ]}
      ></TableSimple>
      <div className="flex justify-start w-fu">
        <ButtonTertiary to="new">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="uppercase font-medium">{t("shared.add")}</span>
        </ButtonTertiary>
      </div>
    </div>
  );
}
// import classNames from "@/utils/shared/ClassesUtils";
// import { CheckIcon, PencilIcon, XIcon } from "@heroicons/react/solid";
// import { WorkflowStatus } from "../../application/enums/WorkflowStatus";

// interface Props {
//   status: WorkflowStatus;
//   className?: string;
// }

// export default function WorkflowStepBadge({ status, className }: Props) {
//   return (
//     <div>
//       status: {status}
//       {status === WorkflowStatus.DRAFT ? (
//         <PencilIcon className={classNames("h-4 w-4", className)} />
//       ) : status === WorkflowStatus.PENDING ? (
//         <CheckIcon className={classNames("h-4 w-4", className)} />
//       ) : status === WorkflowStatus.CANCELLED ? (
//         <XIcon className={classNames("h-4 w-4", className)} />
//       ) : status === WorkflowStatus.COMPLETED ? (
//         <CheckIcon className={classNames("h-4 w-4", className)} />
//       ) : (
//         <div></div>
//       )}
//     </div>
//   );
// }

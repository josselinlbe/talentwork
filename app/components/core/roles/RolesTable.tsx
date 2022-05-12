// import { RefreshIcon } from "@heroicons/react/solid";
// import { UserRole } from "@prisma/client";
// import { useRef } from "react";
// import { useTranslation } from "react-i18next";
// import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
// import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
// import EmptyState from "~/components/ui/emptyState/EmptyState";
// import Loading from "~/components/ui/loaders/Loading";
// import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
// import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
// import UserUtils from "~/utils/app/UserUtils";
// import RoleForm, { RefRoleForm } from "./RoleForm";

// interface Props {
//   editable?: boolean;
//   items: UserRole[];
//   className?: string;
//   loading: boolean;
//   onReload: () => void;
//   onUpdated: (items: UserRole[]) => void;
// }

// export default function RolesTable({ editable = true, items, className, loading, onReload, onUpdated }: Props) {
//   const { t } = useTranslation();

//   const roleForm = useRef<RefRoleForm>(null);
//   const confirmDelete = useRef<RefConfirmModal>(null);
//   const errorModal = useRef<RefErrorModal>(null);

//   function create() {
//     roleForm.current?.create(items.length === 0 ? 1 : Math.max(...items.map((o) => o.order)) + 1);
//   }

//   function update(idx, item) {
//     roleForm.current?.update(idx, item);
//   }

//   function updated(idx, item) {
//     roleForm.current?.close();
//     onUpdated(UserUtils.sortRoles([...items.filter((_f, index) => index !== idx), item]));
//   }

//   function created(item: UserRole) {
//     roleForm.current?.close();
//     onUpdated(UserUtils.sortRoles([...items, item]));
//   }

//   function deleteRole(item: UserRole) {
//     if (item.users.length > 0) {
//       errorModal.current?.show(t("shared.error"), t("app.tenants.roles.errors.cannotDeleteWithUsers"));
//     } else {
//       confirmDelete.current?.setValue(item);
//       confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
//     }
//   }

//   function confirmedDelete(item: UserRole) {
//     services.roles
//       .delete(item.id)
//       .then(() => {
//         onUpdated(UserUtils.sortRoles(items.filter((f) => f !== item)));
//       })
//       .catch((error) => {
//         errorModal.current?.show(t(error));
//       });
//   }

//   function isLastItem(item: UserRole) {
//     const maxOrder = Math.max(...items.map((o) => o.order));
//     return item.order === maxOrder;
//   }

//   function setOrder(items, idx: number, add: number) {
//     return [
//       ...items.slice(0, idx),
//       Object.assign({}, items[idx], {
//         order: items[idx].order + add,
//       }),
//       ...items.slice(idx + 1),
//     ];
//   }

//   function changeOrder(idx: number, add: number) {
//     let newItems = setOrder(items, idx, add);
//     if (add === -1 && idx > 0) {
//       newItems = setOrder(newItems, idx - 1, 1);
//     }
//     if (add === 1 && !isLastItem(items[idx])) {
//       newItems = setOrder(newItems, idx + 1, -1);
//     }
//     newItems = UserUtils.sortRoles(newItems);
//     onUpdated(newItems);
//   }

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center space-x-2 justify-between">
//         <h2 className="font-bold">Roles</h2>
//         <div className="flex items-center space-x-1">
//           <ButtonSecondary disabled={loading} onClick={onReload}>
//             <div className="text-xs -mx-1 ">
//               <RefreshIcon className="h-4 w-4" />
//             </div>
//           </ButtonSecondary>
//           <ButtonSecondary disabled={!editable || loading} onClick={() => create()}>
//             <div className="text-xs -mx-1 ">Add role</div>
//           </ButtonSecondary>
//         </div>
//       </div>
//       <div className={classNames(className, "flex flex-col p-0.5")}>
//         {loading ? (
//           <Loading />
//         ) : (
//           <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
//             <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
//               <div className="shadow overflow-hidden border border-gray-200 sm:rounded-sm">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       {/* <th scope="col" className="px-3 py-1 text-left truncate text-xs font-medium text-gray-400 uppercase tracking-wider">
//                         Order
//                       </th> */}
//                       <th scope="col" className="px-3 py-1 text-left truncate text-xs font-medium text-gray-400 uppercase tracking-wider">
//                         Name
//                       </th>
//                       {/* <th scope="col" className="w-full px-3 py-1 text-left truncate text-xs font-medium text-gray-400 uppercase tracking-wider">
//                       Users
//                     </th> */}
//                       <th scope="col" className="relative px-3 py-1">
//                         <span className="sr-only">Edit</span>
//                       </th>
//                     </tr>
//                   </thead>
//                   {items.length === 0 ? (
//                     <tbody>
//                       <tr>
//                         <td colSpan={5} className="overflow-hidden">
//                           <EmptyState
//                             className="-m-2 bg-white"
//                             size="sm"
//                             captions={{
//                               thereAreNo: "No roles",
//                             }}
//                           />
//                         </td>
//                       </tr>
//                     </tbody>
//                   ) : (
//                     <tbody>
//                       {items.map((item, idx) => (
//                         <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                           {/* <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 w-10">
//                             <div className="flex space-x-1 truncate justify-center">
//                               <button
//                                 type="button"
//                                 onClick={() => changeOrder(idx, -1)}
//                                 className={classNames(
//                                   item.order <= 1 || !editable ? " cursor-not-allowed bg-gray-100 text-gray-300" : "hover:bg-gray-100 hover:text-gray-800",
//                                   "bg-gray-50 px-0.5 py-0.5 text-gray-500 focus:outline-none"
//                                 )}
//                                 disabled={item.order <= 1 || !editable}
//                               >
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
//                                   <path
//                                     fillRule="evenodd"
//                                     d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
//                                     clipRule="evenodd"
//                                   />
//                                 </svg>
//                               </button>
//                               <button
//                                 type="button"
//                                 onClick={() => changeOrder(idx, 1)}
//                                 className={classNames(
//                                   isLastItem(item) || !editable ? " cursor-not-allowed bg-gray-100 text-gray-300" : "hover:bg-gray-100 hover:text-gray-800",
//                                   "bg-gray-50 px-0.5 py-0.5 text-gray-500 focus:outline-none"
//                                 )}
//                                 disabled={isLastItem(item) || !editable}
//                               >
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
//                                   <path
//                                     fillRule="evenodd"
//                                     d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//                                     clipRule="evenodd"
//                                   />
//                                 </svg>
//                               </button>
//                             </div>
//                           </td> */}
//                           <td className="w-full px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
//                             <div className="flex items-center space-x-1 capitalize px-2 py-1 bg-transparent w-full border-b  border-transparent text-sm truncate text-gray-800">
//                               <div className="font-medium">{item.name}</div>
//                               <div className="py-1 bg-transparent block w-full border-b  border-transparent text-sm truncate max-w-lg text-gray-500">
//                                 {/* {item.users.map((f) => `${(f.tenantUser.firstName + " " + f.tenantUser.lastName).trim()} (${f.tenantUser.email})`).join(", ")} */}
//                                 ({item.users.length === 1 ? <span>1 user</span> : <span>{item.users.length} users</span>})
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-3 py-1.5 whitespace-nowrap text-right text-sm font-medium">
//                             <div className="flex space-x-6">
//                               <ButtonTertiary type="button" className=" no-underline" disabled={!editable} onClick={() => update(idx, item)}>
//                                 Edit
//                               </ButtonTertiary>
//                               <ButtonTertiary type="button" className=" no-underline" disabled={!editable} onClick={() => deleteRole(item)}>
//                                 Delete
//                               </ButtonTertiary>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   )}
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//         <RoleForm ref={roleForm} onCreated={created} onUpdated={updated} />
//         <ConfirmModal ref={confirmDelete} destructive onYes={confirmedDelete} />
//         <ErrorModal ref={errorModal} />
//       </div>
//     </div>
//   );
// }

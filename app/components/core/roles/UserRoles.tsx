// import { TenantUserDto } from "@/application/dtos/core/tenants/TenantUserDto";
// import { TenantUserType } from "@/application/enums/core/tenants/TenantUserType";
// import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
// import Loading from "@/components/ui/loaders/Loading";
// import services from "@/services";
// import classNames from "@/utils/shared/ClassesUtils";
// import { updateItemByIdx } from "@/utils/shared/ObjectUtils";
// import UserUtils from "@/utils/store/UserUtils";
// import { useEffect, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { TenantRoleDto } from "../../../application/dtos/core/tenants/TenantRoleDto";
// import SelectTenantUser, { RefSelectTenantUser } from "../users/SelectTenantUser";

// interface Props {
//   editable?: boolean;
//   roles: TenantRoleDto[];
//   className?: string;
//   onUpdatedRole: (roleId: string) => void;
// }

// export default function UserRoles({ editable = true, roles, className, onUpdatedRole }: Props) {
//   const { t } = useTranslation();

//   const selectTenantUser = useRef<RefSelectTenantUser>(null);

//   const [loading, setLoading] = useState<boolean>(false);
//   const [items, setItems] = useState<TenantUserDto[]>([]);

//   const [settingManager, setSettingManager] = useState<boolean>(false);
//   const [currentUserIdx, setCurrentUserIdx] = useState<number>(-1);

//   useEffect(() => {
//     setLoading(true);
//     services.tenantUsers
//       .getAll()
//       .then((response) => {
//         setItems(UserUtils.sortUsers(response));
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   function updateRole(idx: number, item: TenantUserDto, roleId: string, toggle: boolean) {
//     services.roles
//       .toggleUserRole(roleId, {
//         tenantUserId: item.id,
//         toggle,
//       })
//       .then((response) => {
//         console.log("roles", response);
//         updateItemByIdx(items, setItems, idx, {
//           roles: response,
//         });
//         onUpdatedRole(roleId);
//       });
//   }

//   function userHasRole(item: TenantUserDto, role: TenantRoleDto) {
//     return item.roles?.find((f) => f.roleId == role.id) !== undefined;
//   }

//   function updateManager(idx: number, e?: TenantUserDto): void {
//     if (idx === -1) {
//       return;
//     }
//     setSettingManager(true);
//     services.tenantUsers
//       .setManager(items[idx].id, {
//         tenantUserId: e?.id,
//       })
//       .then((response) => {
//         updateItemByIdx(items, setItems, idx, {
//           manager: response.manager,
//           managerId: response.managerId,
//         });
//       })
//       .finally(() => {
//         setCurrentUserIdx(-1);
//         setSettingManager(false);
//       });
//   }

//   function selectUser(idx: number) {
//     setCurrentUserIdx(idx);
//     selectTenantUser.current?.show([items[idx].id]);
//   }

//   function selectedUser(user: TenantUserDto) {
//     updateManager(currentUserIdx, user);
//   }

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center space-x-2 justify-between">
//         <h2 className="font-bold">Users</h2>
//       </div>
//       {loading ? (
//         <Loading />
//       ) : (
//         <div className={classNames(className, "flex flex-col p-0.5")}>
//           <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
//             <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
//               <div className="shadow overflow-hidden border border-gray-200 sm:rounded-sm">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th scope="col" className="px-3 py-1 text-left truncate text-xs font-medium text-gray-400 uppercase tracking-wider">
//                         Type
//                       </th>
//                       <th scope="col" className="px-3 py-1 text-left truncate text-xs font-medium text-gray-400 uppercase tracking-wider">
//                         User
//                       </th>
//                       <th scope="col" className="w-full px-3 py-1 text-left truncate text-xs font-medium text-gray-400 uppercase tracking-wider">
//                         Manager
//                       </th>
//                       {roles?.map((role, idxRole) => {
//                         return (
//                           <th
//                             key={idxRole}
//                             scope="col"
//                             className=" w-20 px-3 py-1 text-left truncate text-xs font-medium text-gray-400 uppercase tracking-wider"
//                             title={role.name}
//                           >
//                             <div className="truncate w-20">{role.name}</div>
//                           </th>
//                         );
//                       })}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {items.map((item, idx) => (
//                       <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                         <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
//                           <div className=" capitalize px-2 py-1 bg-transparent block w-full border-b  border-transparent text-sm truncate text-gray-800">
//                             {t("settings.profile.types." + TenantUserType[item.type])}
//                           </div>
//                         </td>
//                         <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
//                           <div className="truncate flex items-center space-x-1">
//                             <div className="">{(item.firstName + " " + item.lastName).trim()}</div>
//                             <div className="truncate text-gray-500 italic">({item.email.trim()})</div>
//                           </div>
//                         </td>
//                         <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
//                           <div className="flex items-center space-x-1">
//                             {item.manager ? (
//                               <div className="flex items-center space-x-1 justify-between w-52 truncate">
//                                 <div className="truncate flex items-center space-x-1">
//                                   <div className="">{(item.manager.firstName + " " + item.manager.lastName).trim()}</div>
//                                   <div className="truncate text-gray-500 italic">({item.manager.email.trim()})</div>
//                                 </div>
//                                 <ButtonTertiary disabled={settingManager} className=" flex-shrink-0" onClick={() => updateManager(idx, undefined)}>
//                                   Remove
//                                 </ButtonTertiary>
//                               </div>
//                             ) : (
//                               <ButtonTertiary disabled={settingManager} onClick={() => selectUser(idx)}>
//                                 Set manager
//                               </ButtonTertiary>
//                               // <UserSelector exclude={[item.id]} selected={item.manager} onSelected={(e) => updateManager(idx, item, e)} />
//                             )}
//                           </div>
//                         </td>

//                         {roles?.map((role, idxRole) => {
//                           return (
//                             <td key={idxRole} className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
//                               <div className="px-2 py-2 bg-transparent flex justify-center w-full border-b  border-transparent text-sm truncate max-w-lg">
//                                 <input
//                                   id={`user-${item.id}-role-${role.id}`}
//                                   name={`user-${item.id}-role-${role.id}`}
//                                   type="checkbox"
//                                   checked={userHasRole(item, role)}
//                                   onChange={(e) => updateRole(idx, item, role.id, e.currentTarget.checked)}
//                                   className="focus:ring-indigo-500 h-6 w-6 text-indigo-600 border-gray-300 rounded"
//                                 />
//                               </div>
//                             </td>
//                           );
//                         })}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//           <SelectTenantUser ref={selectTenantUser} onSelected={selectedUser} />
//         </div>
//       )}
//     </div>
//   );
// }

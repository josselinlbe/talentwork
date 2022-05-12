import { forwardRef, Fragment, Ref, useImperativeHandle, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { UserRole } from "@prisma/client";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";

export interface RefRoleForm {
  create: (order: number) => void;
  update: (idx: number, item: UserRole) => void;
  close: () => void;
}

interface Props {
  onCreated: (item: UserRole) => void;
  onUpdated: (idx: number, item: UserRole) => void;
}

const RoleForm = ({ onCreated, onUpdated }: Props, ref: Ref<RefRoleForm>) => {
  useImperativeHandle(ref, () => ({ create, update, close }));

  const [open, setOpen] = useState(false);

  const [item, setItem] = useState<UserRole | undefined>();
  const [editingIndex, setEditingIndex] = useState(-1);

  const [order, setOrder] = useState<number>(0);
  const [name, setName] = useState("");
  const [users, setUsers] = useState<UserRole[]>([]);
  // const [roleUsers, setRoleUsers] = useState<UserRole[]>([]);

  // useEffect(() => {
  //   const items: UserRole[] = [];
  //   users.forEach((user) => {
  //     items.push({
  //       id: undefined,
  //       tenantId: undefined,
  //       tenant: {} as TenantDto,
  //       roleId: item?.id ?? "",
  //       role: {} as UserRole,
  //       tenantUserId: user.id,
  //       tenantUser: user,
  //     });
  //   });
  //   setRoleUsers(items);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [users]);

  function create(order: number) {
    setItem(undefined);

    setOrder(order);
    setName("");
    setUsers([]);

    setOpen(true);
  }

  function update(idx: number, item: UserRole) {
    setEditingIndex(idx);

    setItem(item);

    setOrder(item.order);
    setName(item.name);
    // setUsers(item.users);

    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  // function save(e) {
  //   e?.preventDefault();
  //   const saved: UserRole = {
  //     id: undefined,
  //     order,
  //     name,
  //     users,
  //   };
  //   console.log(saved);
  //   if (!item) {
  //     services.roles.create(saved).then((response) => {
  //       onCreated(response);
  //       setOpen(false);
  //     });
  //   } else {
  //     update(editingIndex, saved);
  //     services.roles.update(item.id, saved).then((response) => {
  //       onUpdated(editingIndex, response);
  //       setOpen(false);
  //     });
  //   }
  // }

  // function selectedUsers(e: TenantUserDto) {
  //   const item = users.find((f) => f.id === e.id);
  //   if (item) {
  //     setUsers([...users.filter((f) => f !== item)]);
  //   } else {
  //     setUsers([...users, e]);
  //   }
  // }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <form className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full sm:p-6">
              <div>
                <div className="mt-3 sm:mt-5">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    {item ? "Update role" : "Create role"}
                  </Dialog.Title>
                  <div className="mt-4 space-y-3">
                    <div className="w-full">
                      <label htmlFor="role-name" className="block text-xs font-medium text-gray-700">
                        Name
                      </label>
                      <div className="mt-1">
                        <input
                          required
                          type="text"
                          name="role-name"
                          id="role-name"
                          value={name}
                          onChange={(e) => setName(e.currentTarget.value)}
                          className="capitalize shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    {/* <div className="w-full">
                      <label htmlFor="role-users" className="block text-xs font-medium text-gray-700">
                        Users
                      </label>
                      <div className="mt-1">
                        <UserMultiSelector selected={users} onSelected={selectedUsers} />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 border-t border-gray-200 pt-3">
                <div className="flex items-center space-x-2 justify-end">
                  <ButtonSecondary onClick={close}>Cancel</ButtonSecondary>
                  <ButtonPrimary type="submit">Save</ButtonPrimary>
                </div>
              </div>
            </form>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default forwardRef(RoleForm);

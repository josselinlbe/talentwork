import { Property } from "@prisma/client";
import clsx from "clsx";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSubmit } from "remix";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { getSortedItems } from "~/utils/helpers/TableHelper";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import LockClosedIcon from "../../ui/icons/LockClosedIcon";
import NewFieldIcon from "../../ui/icons/NewFieldIcon";
import PencilIcon from "../../ui/icons/PencilIcon";
import TrashIcon from "../../ui/icons/TrashIcon";
import ConfirmModal, { RefConfirmModal } from "../../ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "../../ui/modals/ErrorModal";
import PropertyBadge from "./PropertyBadge";

interface Props {
  entityId: string;
  items: PropertyWithDetails[];
  className?: string;
  // onUpdated: (items: PropertyWithDetails[]) => void;
}

export default function PropertiesList({ entityId, items, className }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  // const propertyForm = useRef<RefPropertyForm>(null);
  const confirmDelete = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  const [showDefaultFields, setShowDefaultFields] = useState(false);

  function create() {
    const sortedItems = items.sort((a, b) => a.order - b.order);
    const nextOrder = sortedItems.length > 0 ? sortedItems[sortedItems.length - 1].order + 1 : 1;
    // propertyForm.current?.create(nextOrder);
  }

  function update(idx: number, item: PropertyWithDetails) {
    // propertyForm.current?.update(idx, item);
  }

  function updated(item: PropertyWithDetails) {
    // propertyForm.current?.close();
    // setItems(getSortedItems([...items.filter((f) => f.id !== item.id), item]));
  }

  function created(item: Property) {
    // propertyForm.current?.close();
    // setItems(getSortedItems([...items, item]));
  }

  function deleteField(item: Property) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function deleted(item: Property) {
    // setItems(getSortedItems(items.filter((f) => f.id !== item.id)));
  }

  function confirmedDelete(item: Property) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  function isLastItem(item: Property) {
    const customItems = items.filter((f) => !f.isDefault);
    const maxOrder = Math.max(...customItems.map((o) => o.order));
    return item.order === maxOrder;
  }

  function setOrder(items: PropertyWithDetails[], idx: number, add: number) {
    return [
      ...items.slice(0, idx),
      Object.assign({}, items[idx], {
        order: items[idx].order + add,
      }),
      ...items.slice(idx + 1),
    ];
  }

  function changeOrder(idx: number, add: number) {
    const defaultItems = items.filter((f) => f.isDefault);
    const customItems = items.filter((f) => !f.isDefault);

    let newItems = setOrder(customItems, idx, add);
    if (add === -1 && idx > 0) {
      newItems = setOrder(newItems, idx - 1, 1);
    }
    if (add === 1 && !isLastItem(newItems[idx])) {
      newItems = setOrder(newItems, idx + 1, -1);
    }
    newItems = getSortedItems(newItems);
    // setItems([...defaultItems, ...newItems]);
  }

  return (
    <div className={clsx(className, "")}>
      <div className="space-y-2">
        {showDefaultFields && (
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Default Properties</h3>
              {showDefaultFields && (
                <div className="flex justify-end">
                  <ButtonTertiary className="-my-1" onClick={() => setShowDefaultFields(!showDefaultFields)}>
                    Hide default fields
                  </ButtonTertiary>
                </div>
              )}
            </div>
            {items
              .filter((f) => f.isDefault)
              .map((item, idx) => {
                return (
                  <div key={idx} className="bg-gray-100 px-4 py-2 rounded-md shadow-sm border border-gray-300">
                    <div className="flex items-center space-x-2 justify-between">
                      <div className="flex items-center space-x-2">
                        <div className=" flex items-center space-x-3">
                          <div className="  flex items-center space-x-2">
                            <PropertyBadge type={item.type} className="text-gray-400 h-4 w-4" />
                            {/* <div className="truncate text-sm text-gray-400">{t("entities.fields." + PropertyType[item.type])}</div> */}
                          </div>

                          <div className="text-gray-400 text-sm">
                            <PropertyTitle item={item} />
                          </div>
                        </div>
                      </div>
                      <button type="button" disabled className="flex items-center rounded-md border border-transparent p-2">
                        <LockClosedIcon className="h-4 w-4 text-gray-300" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <div className="">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">Properties</h3>
            {!showDefaultFields && (
              <div className="flex justify-end">
                <ButtonTertiary className="-my-1" onClick={() => setShowDefaultFields(!showDefaultFields)}>
                  Show default fields
                </ButtonTertiary>
              </div>
            )}
          </div>

          {items
            .filter((f) => !f.isDefault && !f.isDetail)
            .sort((a, b) => a.order - b.order)
            .map((item, idx) => {
              return (
                <div key={idx} className="bg-white px-4 py-1 rounded-md shadow-sm border border-gray-300">
                  <div className="flex items-center space-x-2 justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <div className=" flex items-center space-x-3 truncate">
                        <div className="  flex items-center space-x-2">
                          <PropertyBadge type={item.type} className="text-gray-400 h-4 w-4" />
                        </div>
                        <div className="text-gray-800 text-sm flex items-center space-x-2 truncate">
                          <PropertyTitle item={item} />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1 flex-shrink-0">
                      <div className="flex space-x-1 truncate p-1">
                        {item.type === PropertyType.SELECT && item.parentId ? (
                          <div className="p-4"></div>
                        ) : (
                          <>
                            <Link
                              to={item.id}
                              className="flex items-center focus:outline-none hover:bg-gray-100 rounded-md border border-transparent p-2 focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 focus:bg-gray-100 group"
                              onClick={() => update(idx, item)}
                            >
                              <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                            </Link>
                            <button
                              type="button"
                              className="flex items-center focus:outline-none hover:bg-gray-100 rounded-md border border-transparent p-2 focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 focus:bg-gray-100 group"
                              onClick={() => deleteField(item)}
                            >
                              <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {items.filter((f) => !f.isDefault && f.isDetail).length > 0 && <h3 className="font-medium text-sm">Table Detail Properties</h3>}
          {items
            .filter((f) => !f.isDefault && f.isDetail)
            .sort((a, b) => a.order - b.order)
            .map((item, idx) => {
              return (
                <div key={idx} className="bg-white px-4 py-1 rounded-md shadow-sm border border-gray-300">
                  <div className="flex items-center space-x-2 justify-between">
                    <div className="flex items-center space-x-2">
                      <div className=" flex items-center space-x-3">
                        <div className="  flex items-center space-x-2">
                          <PropertyBadge type={item.type} className="text-gray-400 h-4 w-4" />
                        </div>
                        <div className="text-gray-800 text-sm flex items-center space-x-2 truncate">
                          <PropertyTitle item={item} />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <div className="flex space-x-1 truncate p-1">
                        {item.type === PropertyType.SELECT && item.parentId ? (
                          <div className="p-4"></div>
                        ) : (
                          <>
                            <Link
                              to={item.id}
                              className="flex items-center focus:outline-none hover:bg-gray-100 rounded-md border border-transparent p-2 focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 focus:bg-gray-100 group"
                              onClick={() => update(idx, item)}
                            >
                              <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                            </Link>
                            <button
                              type="button"
                              className="flex items-center focus:outline-none hover:bg-gray-100 rounded-md border border-transparent p-2 focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 focus:bg-gray-100 group"
                              onClick={() => deleteField(item)}
                            >
                              <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="mt-3">
        <Link
          to={`new`}
          className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <NewFieldIcon className="h-8 mx-auto text-gray-600" />
          <span className="mt-2 block text-sm font-medium text-gray-900">Add new field</span>
        </Link>
      </div>
      {/* <PropertyForm ref={propertyForm} entityId={entityId} onCreated={created} onUpdated={updated} onDeleted={deleted} /> */}
      <ConfirmModal ref={confirmDelete} destructive onYes={confirmedDelete} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

const PropertyTitle = ({ item }: { item: PropertyWithDetails }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex space-x-1 items-baseline">
        <div>
          {t(EntityHelper.getFieldTitle(item, item.isDefault))}
          {item.isRequired && <span className="text-red-500">*</span>}
        </div>
        <div className="text-gray-400 text-xs">({item.name})</div>
      </div>
      {item.type === PropertyType.FORMULA && <div className="text-gray-400 italic truncate">({item.formula})</div>}
      {item.type === PropertyType.SELECT && (
        <div className="text-gray-400 text-xs">[{item.options.length === 0 ? "No options" : item.options?.map((f) => f.value).join(", ")}]</div>
      )}
    </>
  );
};

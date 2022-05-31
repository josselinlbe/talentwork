import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { RowDetailDto } from "~/application/dtos/entities/RowDetailDto";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import OpenModal from "~/components/ui/modals/OpenModal";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import RowHelper from "~/utils/helpers/RowHelper";
import RowForm, { RefRowForm } from "./RowForm";

interface Props {
  entity: EntityWithDetails;
  // currency?: CurrencyDto;
  properties: PropertyWithDetails[];
  editable: boolean;
  initial?: RowDetailDto[];
  className?: string;
  setDetails?: (items: RowDetailDto[]) => void;
}

export default function RowDetailsTable({ entity, properties, editable, initial, className, setDetails }: Props) {
  const rowForm = useRef<RefRowForm>(null);

  const [addingRow, setAddingRow] = useState(false);
  const [editingRow, setEditingRow] = useState<{ row: RowDetailDto; index: number }>();
  const [items, setItems] = useState<RowDetailDto[]>(initial ?? []);

  useEffect(() => {
    if (setDetails) {
      setDetails(items);
    }
  }, [items, setDetails]);

  function create(order?: number) {
    setAddingRow(true);
    // rowForm.current?.create(order ?? items.length);
  }

  function update(index: number, row: RowDetailDto) {
    setEditingRow({ row, index });
    // rowForm.current?.update(idx, item);
  }

  // function updated(idx: number, item: RowDetailDto) {
  //   rowForm.current?.close();
  //   const newItems = items.slice(); //copy the array
  //   newItems[idx] = item; //execute the manipulations
  //   setItems(newItems);
  // }

  // function created(item: RowDetailDto, addAnother: boolean) {
  //   rowForm.current?.close();
  //   setItems([...items, item]);

  //   if (addAnother) {
  //     setTimeout(() => {
  //       create(items.length + 1);
  //     }, 400);
  //   }
  // }

  function deleted(item: RowDetailDto) {
    setItems(items.filter((f) => f !== item));
  }

  function onSubmit(data: RowValueDto[]) {
    setItems([
      ...items,
      {
        id: null,
        folio: null,
        values: data,
      },
    ]);
    setAddingRow(false);
  }

  function onUpdated(values: RowValueDto[], idx: number) {
    const newItems = items.slice();
    newItems[idx] = {
      ...newItems[idx],
      values,
    };
    setItems(newItems);
    setEditingRow(undefined);
  }

  return (
    <div className={clsx(className, "flex flex-col p-0.5")}>
      {items.map((item, idx) => {
        return <input key={idx} hidden readOnly type="text" id={`rows[]`} name={`rows[]`} value={JSON.stringify(item)} />;
      })}

      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border border-gray-200 sm:rounded-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {properties
                    .filter((f) => !f.isDefault && f.isDetail)
                    .map((property, idxProperty) => {
                      return (
                        <th key={idxProperty} scope="col" className="truncate px-3 py-1 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {EntityHelper.getFieldTitle(property)}
                        </th>
                      );
                    })}
                  {editable && (
                    <th scope="col" className="relative px-3 py-1">
                      <span className="sr-only">Edit</span>
                    </th>
                  )}
                </tr>
              </thead>
              {items.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={5 + properties.length} className="overflow-hidden">
                      <EmptyState
                        className="-m-2 bg-white"
                        captions={{
                          thereAreNo: "No details",
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {/* <td className="truncate px-3 py-1.5 whitespace-nowrap text-sm text-gray-800 w-full">{item.folio}</td> */}
                      {properties
                        .filter((f) => !f.isDefault && f.isDetail)
                        .map((property, idxProperty) => {
                          return (
                            <td key={idxProperty} className="truncate px-3 py-1.5 whitespace-nowrap text-sm text-gray-800 w-full">
                              {/* value: {RowHelper.getPropertyValue(entity, item, property)?.toString()} */}
                              {/* <input
                                type="hidden"
                                name={`${property.name}[${idxProperty}]`}
                                value={RowHelper.getPropertyValue(entity, item, property)?.toString()}
                              /> */}
                              <div>{RowHelper.getDetailFormattedValue(entity, item, property)}</div>
                            </td>
                          );
                        })}

                      {editable && (
                        <td className="px-3 py-1.5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              className="flex items-center focus:outline-none hover:bg-gray-100 rounded-md border border-transparent p-2 focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 focus:bg-gray-100 group"
                              onClick={() => update(idx, item)}
                            >
                              <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                            </button>
                            <button
                              type="button"
                              className="flex items-center focus:outline-none hover:bg-gray-100 rounded-md border border-transparent p-2 focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 focus:bg-gray-100 group"
                              onClick={() => deleted(item)}
                            >
                              <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {/* <tr className="bg-gray-100 font-bold">
                    <td colSpan={3} className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 w-10">
                      <div className="max-w-xs truncate"></div>
                    </td>
                  </tr> */}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
      {editable && (
        <div className="flex space-x-2 mt-3">
          <ButtonSecondary disabled={!editable} onClick={() => create()}>
            <div className="text-xs -mx-1 ">Add {entity.title.toLowerCase()} detail</div>
          </ButtonSecondary>
        </div>
      )}
      {addingRow && (
        <OpenModal className="sm:max-w-md bg-gray-50" onClose={() => setAddingRow(false)}>
          <RowForm ref={rowForm} entity={entity} onSubmit={onSubmit} isDetail={true} editing={true} />
        </OpenModal>
      )}
      {editingRow && (
        <OpenModal className="sm:max-w-md bg-gray-50" onClose={() => setEditingRow(undefined)}>
          <RowForm ref={rowForm} entity={entity} item={editingRow.row} onSubmit={(e) => onUpdated(e, editingRow.index)} isDetail={true} editing={true} />
        </OpenModal>
      )}
    </div>
  );
}

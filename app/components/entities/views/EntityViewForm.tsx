import { Property } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Constants from "~/application/Constants";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputNumber from "~/components/ui/input/InputNumber";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputSelect from "~/components/ui/input/InputSelect";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import OrderHelper from "~/utils/helpers/OrderHelper";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
import StringUtils from "~/utils/shared/StringUtils";

interface Props {
  entity: EntityWithDetails;
  item?: EntityViewWithDetails | null;
  canDelete?: boolean;
}
export default function EntityViewForm({ entity, item, canDelete }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const inputName = useRef<RefInputText>(null);

  const [layout, setLayout] = useState(item?.layout ?? "table");
  const [name, setName] = useState(item?.name ?? (OrderHelper.getNextOrder(entity.views) === 1 ? t(entity.titlePlural).toLowerCase() : ""));
  const [title, setTitle] = useState(item?.title ?? (OrderHelper.getNextOrder(entity.views) === 1 ? t(entity.titlePlural) : ""));
  const [order, setOrder] = useState(item?.order ?? OrderHelper.getNextOrder(entity.views));
  const [pageSize, setPageSize] = useState(item?.pageSize ?? Constants.DEFAULT_PAGE_SIZE);
  const [isDefault, setIsDefault] = useState(item?.isDefault ?? OrderHelper.getNextOrder(entity.views) === 1);

  const [properties, setProperties] = useState<{ propertyId: string; order: number }[]>(
    item?.properties ??
      entity.properties
        .filter((f) => !f.isDefault || f.name === "folio" || f.name === "createdAt" || f.name === "createdbyUser")
        .sort((a, b) => a.order - b.order)
        .map((item, idx) => {
          return { propertyId: item.id, order: idx + 1 };
        })
  );
  const [filters, setFilters] = useState<{ name: string; condition: string; value: string }[]>(item?.filters ?? []);
  // const [sort, setSort] = useState<{ name: string; asc: boolean; order: number }[]>(item?.sort ?? []);

  // Board
  const [groupBy, setGroupBy] = useState<string | number | undefined>(item?.groupByPropertyId ? "byProperty" : "byWorkflowStates");
  const [groupByPropertyId, setGroupByPropertyId] = useState<string | number | undefined>(item?.groupByPropertyId ?? undefined);
  const [groupByOptions, setGroupByOptions] = useState<{ name: string; value: string }[]>([]);
  const [selectProperties, setSelectProperties] = useState<Property[]>([]);

  // Grid
  const [columns, setColumns] = useState<number>(item?.columns ?? 3);

  const [filterByProperties, setFilterByProperties] = useState<{ name: string; value: string }[]>([]);

  useEffect(() => {
    setTimeout(() => {
      inputName.current?.input.current?.focus();
    }, 100);

    const selectProperties = entity.properties.filter((f) => f.type === PropertyType.SELECT);
    setGroupByOptions([
      {
        name: "Workflow States",
        value: "byWorkflowStates",
      },
      {
        name: "Property",
        value: "byProperty",
      },
    ]);
    setSelectProperties(selectProperties);

    let filterByProperties = entity.properties
      .filter((f) => f.type === PropertyType.TEXT)
      .map((property) => {
        return {
          name: t(property.title),
          value: property.name,
        };
      });
    if (entity.workflowStates.length > 0) {
      filterByProperties = [
        {
          name: "Workflow State",
          value: "workflowState",
        },
        ...filterByProperties,
      ];
    }
    setFilterByProperties(filterByProperties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!item) {
      setTitle(StringUtils.capitalize(name.toLowerCase()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function getPropertyByName(name: string) {
    return entity.properties.find((f) => f.name === name);
  }

  function getPropertyById(id: string) {
    return entity.properties.find((f) => f.id === id);
  }

  function getPropertyConditionsByName(name: string) {
    if (name === "workflowState") {
      return [{ value: "equals", name: "Equals" }];
    } else {
      const property = getPropertyByName(name);
      if (property?.type === PropertyType.TEXT) {
        return [
          { value: "equals", name: "Equals" },
          { value: "contains", name: "Contains" },
          { value: "lt", name: "Less than" },
          { value: "lte", name: "Less or equal" },
          { value: "gt", name: "Greater than" },
          { value: "gte", name: "Greater or equal" },
          { value: "startsWith", name: "Starts with" },
          { value: "endsWith", name: "Ends with" },
          { value: "in", name: "In (use commas)" },
          { value: "notIn", name: "Not in (use commas)" },
        ];
      }
    }
    return [];
  }

  return (
    <FormGroup id={item?.id} onCancel={() => navigate(`/admin/entities/${entity.slug}/views`)} editing={true} canDelete={canDelete}>
      <InputGroup title="View">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <InputRadioGroup
            className="sm:col-span-12"
            name="layout"
            title="Layout"
            value={layout}
            setValue={(e) => setLayout(e?.toString() ?? "")}
            options={[
              { name: "Table", value: "table" },
              { name: "Board", value: "board" },
              { name: "Grid", value: "grid" },
            ]}
          />

          <InputText
            className="sm:col-span-6"
            name="name"
            title={t("models.entity.name")}
            value={name}
            setValue={setName}
            autoComplete="off"
            required
            lowercase
          />
          <InputText
            className="sm:col-span-6"
            name="title"
            title={t("models.entity.title")}
            value={title}
            setValue={setTitle}
            autoComplete="off"
            required
            withTranslation={true}
          />
          <InputNumber
            className="sm:col-span-6"
            name="pageSize"
            title={"Page size"}
            value={pageSize}
            setValue={setPageSize}
            min={1}
            max={500}
            required
            disabled={layout !== "table"}
          />
          <InputNumber
            className="sm:col-span-6"
            name="order"
            title={t("models.entity.order")}
            value={order}
            setValue={setOrder}
            disabled={!item}
            min={1}
            max={99}
            required
          />
          <InputCheckboxInline className="sm:col-span-12" name="isDefault" title="Is default" value={isDefault} setValue={setIsDefault} />
        </div>
      </InputGroup>

      {layout === "board" && (
        <InputGroup title="Board">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <>
              <InputSelect className="sm:col-span-6" name="groupBy" title="Group by" value={groupBy} setValue={setGroupBy} options={groupByOptions} />
              {groupBy === "byWorkflowStates" ? (
                <InputText
                  className="sm:col-span-6"
                  name=""
                  title="States"
                  disabled={true}
                  value={entity.workflowStates.length === 0 ? "No workflow states" : entity.workflowStates.map((f) => t(f.title)).join(", ")}
                />
              ) : (
                <InputSelect
                  className="sm:col-span-6"
                  name="groupByPropertyId"
                  title="Property"
                  value={groupByPropertyId}
                  setValue={setGroupByPropertyId}
                  options={selectProperties.map((item) => {
                    return {
                      name: t(item.title),
                      value: item.id,
                    };
                  })}
                />
              )}
            </>
          </div>
        </InputGroup>
      )}

      {layout === "grid" && (
        <InputGroup title="Grid">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <InputNumber className="sm:col-span-6" name="columns" title="Columns" value={columns} setValue={setColumns} min={1} max={12} required />
          </div>
        </InputGroup>
      )}

      <InputGroup title="Properties">
        <div className="divide-y divide-gray-200">
          {properties.map((item) => (
            <input key={item.propertyId} type="text" name="properties[]" readOnly hidden value={JSON.stringify(item)} />
          ))}
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="font-medium text-sm">All</div>
              <div className="bg-gray-50 space-y-1 border-2 border-dashed border-gray-300 rounded-md p-2 h-32 overflow-y-scroll">
                {entity.properties.map((item, idx) => (
                  <div key={item.name}>
                    <InputCheckboxInline
                      name={"properties[" + idx + "].propertyId"}
                      title={t(item.title)}
                      description={<span className="pl-1 text-xs font-normal text-gray-500">({item.name})</span>}
                      value={properties.find((f) => f.propertyId === item.id) !== undefined}
                      setValue={(e) => {
                        if (e) {
                          setProperties([...properties, { propertyId: item.id, order: OrderHelper.getNextOrder(properties) }]);
                        } else {
                          setProperties(properties.filter((f) => f.propertyId !== item.id));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-medium text-sm">Displayed</div>
              <div className="bg-gray-50 space-y-1 border-2 border-dashed border-gray-300 rounded-md p-2 h-32 overflow-y-scroll">
                {properties
                  .sort((a, b) => a.order - b.order)
                  .map((item, idx) => (
                    <div key={idx} className="flex items-baseline space-x-2 text-sm">
                      <div className="font-medium">{t(getPropertyById(item.propertyId)?.title ?? "")}</div>
                      <div className="text-xs font-normal text-gray-500">({getPropertyById(item.propertyId)?.name})</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </InputGroup>

      <InputGroup title="Filters">
        {filters.map((item, idx) => (
          <input key={idx} type="text" name="filters[]" readOnly hidden value={JSON.stringify(item)} />
        ))}
        <div className="space-y-2 mb-2">
          {filters.map((item, idx) => (
            <CollapsibleRow
              className="bg-gray-50"
              initial={true}
              key={idx}
              title={`${item.name} (${item.condition}) ${item.value}`}
              value={
                <div className="flex space-x-1 items-center text-sm">
                  <div className="font-medium">{item.name}</div>
                  <div className="font-light text-gray-500">{item.condition}</div>
                  <div className="">{item.value}</div>
                </div>
              }
              onRemove={() => setFilters(filters.filter((_, i) => i !== idx))}
            >
              <div className="grid grid-cols-3 gap-3">
                <InputSelector
                  withSearch={false}
                  name={"filters[" + idx + "].propertyId"}
                  title="Property"
                  value={item.name}
                  setValue={(e) =>
                    updateItemByIdx(filters, setFilters, idx, {
                      name: e,
                    })
                  }
                  options={filterByProperties}
                />
                <InputSelector
                  withSearch={false}
                  name={"filters[" + idx + "].condition"}
                  title="Condition"
                  value={item.condition}
                  setValue={(e) =>
                    updateItemByIdx(filters, setFilters, idx, {
                      condition: e,
                    })
                  }
                  options={getPropertyConditionsByName(item.name)}
                />
                {item.name === "workflowState" ? (
                  <InputSelector
                    withSearch={false}
                    withColors={true}
                    name={"filters[" + idx + "].value"}
                    title="Value"
                    value={item.value}
                    setValue={(e) => updateItemByIdx(filters, setFilters, idx, { value: e })}
                    options={entity.workflowStates
                      .sort((a, b) => a.order - b.order)
                      .map((item) => {
                        return {
                          name: t(item.title),
                          value: item.name,
                          color: item.color,
                        };
                      })}
                  />
                ) : (
                  <InputText
                    name={"filters[" + idx + "].value"}
                    title="Value"
                    value={item.value}
                    setValue={(e) => updateItemByIdx(filters, setFilters, idx, { value: e })}
                  />
                )}
              </div>
            </CollapsibleRow>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFilters([...filters, { name: entity.properties.find((f) => !f.isDefault)?.name ?? "", condition: "equals", value: "" }])}
          className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <span className="block text-xs font-normal text-gray-500">{filters.length === 0 ? "No filters" : "Add filter"}</span>
        </button>
      </InputGroup>

      {/* <InputGroup title="Sort">
        {sort.map((item, idx) => (
          <input key={idx} type="text" name="sort[]" readOnly hidden value={JSON.stringify(item)} />
        ))}
        <div className="space-y-2 mb-2">
          {sort
            .sort((a, b) => a.order - b.order)
            .map((item, idx) => (
              <CollapsibleRow
                className="bg-gray-50"
                key={idx}
                initial={true}
                title={`${item.name} (${item.asc ? "asc" : "desc"})`}
                value={
                  <div className="flex space-x-1 items-center text-sm">
                    <div className="font-medium">{item.name}</div>
                    <div className="font-light text-gray-500">{item.asc ? "asc" : "desc"}</div>
                  </div>
                }
                onRemove={() => setSort(sort.filter((_, i) => i !== idx))}
              >
                <div className="grid grid-cols-2 gap-3">
                  <InputSelector
                    withSearch={false}
                    name={"sort[" + idx + "].name"}
                    title="Property"
                    value={item.name}
                    setValue={(e) => updateItemByIdx(sort, setSort, idx, { name: e })}
                    options={entity.properties.map((property) => {
                      return {
                        name: t(property.title),
                        value: property.name,
                      };
                    })}
                  />
                  <InputSelect
                    name={"sort[" + idx + "].order"}
                    title="Order"
                    value={item.asc ? "asc" : "desc"}
                    setValue={(e) => updateItemByIdx(sort, setSort, idx, { asc: e?.toString() === "asc" })}
                    options={[
                      {
                        name: "Ascending",
                        value: "asc",
                      },
                      {
                        name: "Descending",
                        value: "desc",
                      },
                    ]}
                  />
                </div>
              </CollapsibleRow>
            ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setSort([...sort, { name: entity.properties.find((f) => !f.isDefault)?.name ?? "", asc: true, order: OrderHelper.getNextOrder(sort) }])
          }
          className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <span className="block text-xs font-normal text-gray-500">{filters.length === 0 ? "No sort fields" : "Add sort"}</span>
        </button>
      </InputGroup> */}
    </FormGroup>
  );
}

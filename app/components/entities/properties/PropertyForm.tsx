import { Property } from "@prisma/client";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import FormGroup from "~/components/ui/forms/FormGroup";
import PencilAltIcon from "~/components/ui/icons/PencilAltIcon";
import ViewListIcon from "~/components/ui/icons/ViewListIcon";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputNumber from "~/components/ui/input/InputNumber";
import InputText from "~/components/ui/input/InputText";
import { PropertyWithDetails, EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import StringUtils from "~/utils/shared/StringUtils";
import EntitySelector from "../EntitySelector";
import PropertyTypeSelector from "./PropertyTypeSelector";
import PropertyOptionsForm, { OptionValue, RefPropertyOptionsForm } from "./PropertyOptionsForm";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";
import PropertyAttribute from "./PropertyAttribute";

interface Props {
  item?: PropertyWithDetails;
  properties: PropertyWithDetails[];
  entities: EntityWithDetails[];
  parentEntity?: EntityWithDetails | undefined;
}

export default function PropertyForm({ item, properties, entities, parentEntity }: Props) {
  const { t } = useTranslation();

  const selectOptionsForm = useRef<RefPropertyOptionsForm>(null);

  // TODO: Implement User, Role, Entity and Formula types

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const [, setParentId] = useState<string | undefined>(item?.parentId ?? undefined);
  const [, setParent] = useState<Property | undefined>(item?.parent);
  const [order, setOrder] = useState<number>(item?.order ?? Math.max(...properties.map((o) => o.order)) + 1);
  const [name, setName] = useState<string>(item?.name ?? "");
  const [title, setTitle] = useState<string>(item?.title ?? "");
  const [type, setType] = useState<PropertyType>(item?.type ?? PropertyType.TEXT);
  const [options, setOptions] = useState<OptionValue[]>(item?.options ?? []);
  const [isDynamic, setIsDynamic] = useState<boolean>(item?.isDynamic ?? true);
  const [isRequired, setIsRequired] = useState<boolean>(item?.isRequired ?? true);
  const [isHidden, setIsHidden] = useState<boolean>(item?.isHidden ?? false);
  const [isDetail, setIsDetail] = useState<boolean>(item?.isDetail ?? false);
  const [attributes, setAttributes] = useState<{ name: string; value: string | undefined }[]>(item?.attributes ?? []);

  const [entity, setEntity] = useState<EntityWithDetails>();
  const [formula, setFormula] = useState<string>();

  const [titleEnabled, setTitleEnabled] = useState(false);

  useEffect(() => {
    setEntity(parentEntity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (type !== PropertyType.ENTITY) {
      setName(StringUtils.toCamelCase(title.toLowerCase()));
    }
  }, [title, type]);

  useEffect(() => {
    let formField = entity?.properties.find((f) => f.type === PropertyType.ID);
    if (formField && entity) {
      formField = { ...formField, ...entity };
      setParentId(formField?.id);
      setParent(formField);
    }
    if (entity) {
      setTitle(entity.title);
      setName(entity.name);
    }
  }, [entity]);

  useEffect(() => {
    setTitleEnabled(true);
  }, [type]);

  return (
    <>
      <FormGroup
        id={item?.id}
        editing={true}
        canDelete={item !== undefined && !item?.isDefault && showAdvancedOptions}
        className="pb-4 space-y-2"
        classNameFooter="px-4"
      >
        <input type="hidden" name="order" value={order} />

        <div className="mt-4">
          <div className="px-4 space-y-3">
            <div className="w-full">
              <label htmlFor="type" className="block text-xs font-medium text-gray-700">
                Type
              </label>
              <div className="mt-1">
                <PropertyTypeSelector selected={type} onSelected={(e) => setType(e)} />
              </div>
            </div>
            {type === PropertyType.ENTITY && (
              <div className="w-full">
                <label htmlFor="entity" className="block text-xs font-medium text-gray-700">
                  Entity
                </label>
                <div className="mt-1">
                  <EntitySelector items={entities} selected={entity} onSelected={(e) => setEntity(e)} />
                </div>
              </div>
            )}
            {titleEnabled && (
              <InputText
                name="title"
                title={t("models.property.title")}
                value={title}
                setValue={(e) => setTitle(e)}
                disabled={!titleEnabled}
                required
                withTranslation
                placeholder="Property title..."
              />
            )}
            <InputText
              name="name"
              title={t("models.property.name")}
              value={name}
              setValue={(e) => setName(e)}
              required
              placeholder="Property name..."
              pattern="[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?"
              hint={<span className="text-gray-400 font-normal italic">Camel case</span>}
            />
            {type === PropertyType.FORMULA && (
              <div className="w-full">
                <label htmlFor="formula" className="block text-xs font-medium text-gray-700">
                  {t("entities.fields.FORMULA")}
                </label>
                <div className="mt-1">
                  <InputText
                    name="formula"
                    title={t("models.property.formula")}
                    value={formula}
                    setValue={(e) => setFormula(e.toString())}
                    disabled={!titleEnabled}
                    required
                  />
                </div>
              </div>
            )}
            {type === PropertyType.SELECT && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ViewListIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    {options.map((option) => {
                      return <input key={option.order} hidden readOnly type="text" id="options[]" name="options[]" value={JSON.stringify(option)} />;
                    })}
                    <input
                      disabled
                      className="border bg-gray-100 focus:ring-accent-500 focus:border-accent-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                      value={options.length === 0 ? "No dropdown values defined" : options.map((f) => f.value).join(", ")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => selectOptionsForm.current?.set(options)}
                    className="-ml-px relative inline-flex items-center space-x-2 px-4 py-1.5 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
                  >
                    <PencilAltIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>Set</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex">
              <ButtonTertiary onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                {!showAdvancedOptions ? "Show advanced options" : "Hide advanced options"}
              </ButtonTertiary>
            </div>
          </div>

          <div className={clsx("my-2 px-4 space-y-3 bg-gray-50 py-3 border border-gray-300 border-dashed", showAdvancedOptions ? "" : "hidden")}>
            <div className="w-full">
              <InputNumber name="order" title={t("models.property.order")} value={order} setValue={setOrder} />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="is-dynamic"
                title={t("models.property.isDynamic")}
                description="Uncheck if you plan to manually set the database model property for this field."
                value={isDynamic}
                setValue={setIsDynamic}
              />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="is-required"
                title={t("models.property.isRequired")}
                description="Forces user to set value"
                value={isRequired}
                setValue={setIsRequired}
              />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="is-hidden"
                title={t("models.property.isHidden")}
                description="Defines if visible in forms, views and reports"
                value={isHidden}
                setValue={setIsHidden}
              />
            </div>

            <div className="w-full">
              <InputCheckboxWithDescription
                name="is-detail"
                title={t("models.property.isDetail")}
                description="Is a table detail property"
                value={isDetail}
                setValue={setIsDetail}
              />
            </div>
            {/* <div className="font-bold">{t("models.propertyAttribute.plural")}</div> */}

            {attributes.map((attribute) => {
              return <input key={attribute.name} hidden readOnly type="text" id="attributes[]" name="attributes[]" value={JSON.stringify(attribute)} />;
            })}

            {PropertyAttributeHelper.getAttributesByType(type, attributes).map((item) => {
              return (
                <PropertyAttribute
                  className="mb-2"
                  key={item}
                  name={item}
                  title={PropertyAttributeHelper.getAttributeTitle(t, item)}
                  value={attributes.find((f) => f.name === item)?.value ?? undefined}
                  setValue={(e) => {
                    const value = { name: item, value: e?.toString() };
                    const found = attributes.find((f) => f.name === item);
                    if (found) {
                      setAttributes([...attributes.filter((f) => f.name !== item), value]);
                    } else {
                      setAttributes([...attributes, value]);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </FormGroup>
      <PropertyOptionsForm ref={selectOptionsForm} title={title} onSet={(e) => setOptions(e)} />
    </>
  );
}

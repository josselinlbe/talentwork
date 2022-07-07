import { Dialog, Transition } from "@headlessui/react";
import { Property } from "@prisma/client";
import clsx from "clsx";
import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "@remix-run/react";
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
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";

interface Props {
  item?: PropertyWithDetails;
  properties: PropertyWithDetails[];
  entities: EntityWithDetails[];
  parentEntity?: EntityWithDetails | undefined;
}

export default function PropertyForm({ item, properties, entities, parentEntity }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

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
  const [pattern, setPattern] = useState<string>(item?.attributes?.pattern ?? "");
  const [min, setMin] = useState<number | undefined>(item?.attributes?.min ?? undefined);
  const [max, setMax] = useState<number | undefined>(item?.attributes?.max ?? undefined);
  const [step, setStep] = useState<string | undefined>(item?.attributes?.step ?? undefined);
  const [rows, setRows] = useState<number | undefined>(item?.attributes?.rows ?? undefined);
  const [uppercase, setUppercase] = useState<boolean | undefined>(item?.attributes?.uppercase ?? undefined);
  const [lowercase, setLowercase] = useState<boolean | undefined>(item?.attributes?.lowercase ?? undefined);

  const [defaultValue, setDefaultValue] = useState<string | undefined>(item?.attributes?.defaultValue ?? undefined);

  const [maxSize, setMaxSize] = useState<number | undefined>(item?.attributes?.maxSize ?? undefined);
  const [acceptFileTypes, setAcceptFileTypes] = useState<string | undefined>(item?.attributes?.acceptFileTypes ?? undefined);

  const [hintText, setHintText] = useState<string | undefined>(item?.attributes?.hintText ?? undefined);
  const [helpText, setHelpText] = useState<string | undefined>(item?.attributes?.helpText ?? undefined);
  const [placeholder, setPlaceholder] = useState<string | undefined>(item?.attributes?.placeholder ?? undefined);
  const [icon, setIcon] = useState<string | undefined>(item?.attributes?.icon ?? undefined);

  const [entity, setEntity] = useState<EntityWithDetails>();
  const [formula, setFormula] = useState<string>();

  const [titleEnabled, setTitleEnabled] = useState(false);

  useEffect(() => {
    setEntity(parentEntity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setName(StringUtils.toCamelCase(title.toLowerCase()));
  }, [title]);

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
  // useEffect(() => {
  //   setParentId(formField?.id ?? "");
  //   setParent(formField);
  // }, [formField]);

  // useEffect(() => {
  //   if (type === PropertyType.ENTITY) {
  //     setTitle(parent?.title ?? "");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [parent]);

  useEffect(() => {
    setTitleEnabled(true);
  }, [type]);

  function close() {
    navigate(`/admin/entities/${params.slug}/properties`);
  }

  function supportsMinAndMax() {
    return [PropertyType.TEXT, PropertyType.NUMBER, PropertyType.MEDIA].includes(type);
  }

  function supportsDefaultValue() {
    return [PropertyType.TEXT, PropertyType.NUMBER, PropertyType.BOOLEAN, PropertyType.SELECT].includes(type);
  }

  function supportsPlaceholder() {
    return [PropertyType.TEXT, PropertyType.NUMBER, PropertyType.SELECT].includes(type);
  }

  return (
    <>
      <FormGroup id={item?.id} editing={true} canDelete={item !== undefined && !item?.isDefault && showAdvancedOptions} className="px-4 pb-4 space-y-2">
        {/* <input type="hidden" name="order" value={order} /> */}

        <div className="mt-4 space-y-3">
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
              className={clsx(
                !titleEnabled && "bg-gray-100 cursor-not-allowed",
                "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              )}
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
            className={clsx("shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md")}
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
                  className={clsx(
                    !titleEnabled && "bg-gray-100 cursor-not-allowed",
                    "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  )}
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
                    className="border bg-gray-100 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                    value={options.length === 0 ? "No dropdown values defined" : options.map((f) => f.value).join(", ")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => selectOptionsForm.current?.set(options)}
                  className="-ml-px relative inline-flex items-center space-x-2 px-4 py-1.5 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
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

          {showAdvancedOptions && (
            <>
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

              {type === PropertyType.TEXT && (
                <div className="w-full">
                  <InputText
                    name="pattern"
                    title={t("models.propertyAttribute.pattern")}
                    value={pattern}
                    setValue={setPattern}
                    hint={
                      <>
                        {pattern && (
                          <button type="button" onClick={() => setPattern("")} className="text-xs text-gray-600 hover:text-red-500">
                            {t("shared.remove")}
                          </button>
                        )}
                      </>
                    }
                  />
                </div>
              )}
              {supportsMinAndMax() && (
                <>
                  <div className="w-full">
                    <InputNumber
                      name="min"
                      title={t("models.propertyAttribute.min")}
                      value={min}
                      setValue={(e) => setMin(e ? Number(e) : undefined)}
                      hint={
                        <>
                          {min && (
                            <button type="button" onClick={() => setMin(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                              {t("shared.remove")}
                            </button>
                          )}
                        </>
                      }
                    />
                  </div>
                  <div className="w-full">
                    <InputNumber
                      name="max"
                      title={t("models.propertyAttribute.max")}
                      value={max}
                      setValue={(e) => setMax(e ? Number(e) : undefined)}
                      hint={
                        <>
                          {max && (
                            <button type="button" onClick={() => setMax(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                              {t("shared.remove")}
                            </button>
                          )}
                        </>
                      }
                    />
                  </div>
                </>
              )}

              {type === PropertyType.NUMBER && (
                <div className="w-full">
                  <InputText
                    name="step"
                    title={t("models.propertyAttribute.step")}
                    value={step}
                    setValue={(e) => setStep(e.toString())}
                    placeholder="0.01"
                    hint={
                      <>
                        {step && (
                          <button type="button" onClick={() => setStep(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                            {t("shared.remove")}
                          </button>
                        )}
                      </>
                    }
                  />
                </div>
              )}

              {supportsDefaultValue() && (
                <>
                  <div className="w-full">
                    <InputText
                      name="default-value"
                      title={t("models.propertyAttribute.defaultValue")}
                      value={defaultValue}
                      setValue={(e) => setDefaultValue(e.toString() ?? undefined)}
                      hint={
                        <>
                          {defaultValue && (
                            <button type="button" onClick={() => setDefaultValue(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                              {t("shared.remove")}
                            </button>
                          )}
                        </>
                      }
                    />
                  </div>
                </>
              )}

              {type === PropertyType.MEDIA && (
                <>
                  <div className="w-full">
                    <InputText
                      name="accept-file-types"
                      title={t("models.propertyAttribute.acceptFileTypes")}
                      value={acceptFileTypes}
                      setValue={(e) => setAcceptFileTypes(e.toString() ?? undefined)}
                      hint={
                        <>
                          {acceptFileTypes && (
                            <button type="button" onClick={() => setAcceptFileTypes(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                              {t("shared.remove")}
                            </button>
                          )}
                        </>
                      }
                    />
                  </div>

                  <div className="w-full">
                    <InputNumber
                      name="max-size"
                      title={t("models.propertyAttribute.maxSize")}
                      value={maxSize}
                      setValue={(e) => setMaxSize(e ? Number(e) : undefined)}
                      hint={
                        <>
                          {maxSize !== undefined && (
                            <button type="button" onClick={() => setMaxSize(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                              {t("shared.remove")}
                            </button>
                          )}
                        </>
                      }
                    />
                  </div>
                </>
              )}

              <div className="w-full">
                <InputText
                  name="hint-text"
                  title={t("models.propertyAttribute.hintText")}
                  value={hintText}
                  setValue={(e) => setHintText(e.toString() ?? undefined)}
                  hint={
                    <>
                      {hintText && (
                        <button type="button" onClick={() => setHintText(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                          {t("shared.remove")}
                        </button>
                      )}
                    </>
                  }
                />
              </div>
              <div className="w-full">
                <InputText
                  name="help-text"
                  title={t("models.propertyAttribute.helpText")}
                  value={helpText}
                  setValue={(e) => setHelpText(e.toString() ?? undefined)}
                  hint={
                    <>
                      {helpText && (
                        <button type="button" onClick={() => setHelpText(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                          {t("shared.remove")}
                        </button>
                      )}
                    </>
                  }
                />
              </div>
              {supportsPlaceholder() && (
                <div className="w-full">
                  <InputText
                    name="placeholder"
                    title={t("models.propertyAttribute.placeholder")}
                    value={placeholder}
                    setValue={(e) => setPlaceholder(e.toString() ?? undefined)}
                    hint={
                      <>
                        {placeholder && (
                          <button type="button" onClick={() => setPlaceholder(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                            {t("shared.remove")}
                          </button>
                        )}
                      </>
                    }
                  />
                </div>
              )}
              <div className="w-full">
                <InputText
                  name="icon"
                  title={t("models.propertyAttribute.icon")}
                  value={icon}
                  setValue={(e) => setIcon(e.toString() ?? undefined)}
                  hint={
                    <>
                      {icon && (
                        <button type="button" onClick={() => setIcon(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                          {t("shared.remove")}
                        </button>
                      )}
                    </>
                  }
                />
              </div>

              {type === PropertyType.TEXT && (
                <>
                  <div className="w-full">
                    <InputNumber
                      name="rows"
                      title={t("models.propertyAttribute.rows")}
                      value={rows}
                      setValue={(e) => setRows(e ? Number(e) : undefined)}
                      hint={
                        <>
                          {rows && (
                            <button type="button" onClick={() => setRows(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                              {t("shared.remove")}
                            </button>
                          )}
                        </>
                      }
                    />
                  </div>
                  <div className="w-full">
                    <InputCheckboxWithDescription
                      description="Force text to be uppercase"
                      name="uppercase"
                      title={t("models.propertyAttribute.uppercase")}
                      value={uppercase}
                      setValue={(e) => setUppercase(e ? Boolean(e) : undefined)}
                    />
                  </div>
                  <div className="w-full">
                    <InputCheckboxWithDescription
                      description="Force text to be lowercase"
                      name="lowercase"
                      title={t("models.propertyAttribute.lowercase")}
                      value={lowercase}
                      setValue={(e) => setLowercase(e ? Boolean(e) : undefined)}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </FormGroup>
      <PropertyOptionsForm ref={selectOptionsForm} title={title} onSet={(e) => setOptions(e)} />
    </>
  );
}

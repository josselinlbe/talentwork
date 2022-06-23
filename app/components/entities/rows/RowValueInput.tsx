import { PropertyOption, Media } from "@prisma/client";
import { Ref, useImperativeHandle, useRef, useState, useEffect, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { RefRoleSelector } from "~/components/core/roles/RoleSelector";
import UserSelector, { RefUserSelector } from "~/components/core/users/UserSelector";
import InputDate, { RefInputDate } from "~/components/ui/input/InputDate";
import InputNumber, { RefInputNumber } from "~/components/ui/input/InputNumber";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { PropertyWithDetails, EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { TenantUserWithUser } from "~/utils/db/tenants.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { RefEntitySelector } from "../EntitySelector";
import PropertyMediaInput from "../properties/PropertyMediaInput";
import PropertyOptionSelector from "../properties/PropertyOptionSelector";
import InputCheckbox from "~/components/ui/input/InputCheckbox";

export interface RefRowValueInput {
  focus: () => void;
}

interface Props {
  selected: PropertyWithDetails | undefined;
  entity: EntityWithDetails;
  idValue: string | undefined;
  textValue: string | undefined;
  numberValue: number | undefined;
  dateValue: Date | undefined;
  booleanValue: boolean | undefined;
  relatedRowId?: string | undefined;
  initialMedia?: Media[] | undefined;
  initialOption?: PropertyOption | undefined;
  parentSelectedValue: RowValueDto | undefined;
  onChange: (value: string | number | Date | boolean | undefined | null) => void;
  onChangeRelatedRequest?: (related: string | undefined) => void;
  onChangeOption?: (option: PropertyOption | undefined) => void;
  onChangeMedia?: (option: MediaDto[]) => void;
  readOnly: boolean;
  className?: string;
  relatedEntity: { propertyId: string; entity: EntityWithDetails; rows: RowWithDetails[] } | undefined;
}

const RowValueInput = (
  {
    selected,
    textValue,
    numberValue,
    dateValue,
    booleanValue,
    relatedRowId,
    initialMedia,
    initialOption,
    parentSelectedValue,
    onChange,
    onChangeOption,
    onChangeMedia,
    className,
    readOnly,
    relatedEntity,
  }: Props,
  ref: Ref<RefRowValueInput>
) => {
  useImperativeHandle(ref, () => ({ focus }));

  const { t } = useTranslation();

  const numberInput = useRef<RefInputNumber>(null);
  const textInput = useRef<RefInputText>(null);
  const dateInput = useRef<RefInputDate>(null);
  const roleInput = useRef<RefRoleSelector>(null);
  const userInput = useRef<RefUserSelector>(null);
  const entitySelector = useRef<RefEntitySelector>(null);

  // const [roles, setRoles] = useState<TenantUserRole[]>([]);
  const [userId, setUserId] = useState<string>();
  const [user, setUser] = useState<TenantUserWithUser>();
  // const [formField, setProperty] = useState<Property>();
  const [media, setMedia] = useState<MediaDto[]>([]);
  // const [formula, setFormula] = useState<string>("");

  function focus() {
    if (selected?.type === PropertyType.TEXT) {
      textInput.current?.input.current?.focus();
    } else if (selected?.type === PropertyType.NUMBER) {
      numberInput.current?.input.current?.focus();
    } else if (selected?.type === PropertyType.DATE) {
      dateInput.current?.input.current?.focus();
    } else if (selected?.type === PropertyType.ENTITY) {
      entitySelector.current?.focus();
    } else if (selected?.type === PropertyType.ROLE) {
      roleInput.current?.focus();
    } else if (selected?.type === PropertyType.USER) {
      userInput.current?.focus();
    }
  }

  // useEffect(() => {
  //   if (selected?.type === PropertyType.ROLE) {
  //     onChange(roles.map((f) => f.id).join(","));
  //   }
  // }, [roles]);

  useEffect(() => {
    if (selected?.type === PropertyType.USER) {
      onChange(userId ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (selected?.type === PropertyType.MEDIA) {
      if (onChangeMedia) {
        onChangeMedia(media);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  // useEffect(() => {
  //   if (selected?.type === PropertyType.FORMULA) {
  //     onChange(formula);
  //   }
  // }, [formula]);

  return (
    <>
      {selected?.type === PropertyType.TEXT ? (
        <InputText
          ref={textInput}
          name={selected.name}
          title={t(selected.title)}
          value={textValue}
          setValue={(e) => onChange(e.toString())}
          required={selected.isRequired}
          className={className}
          readOnly={readOnly}
        />
      ) : selected?.type === PropertyType.NUMBER ? (
        <InputNumber
          ref={numberInput}
          name={selected.name}
          title={t(selected.title)}
          required={selected.isRequired}
          value={numberValue}
          setValue={(e) => onChange(Number(e).toString())}
          max={100000000}
          disabled={selected.isDefault}
          className={className}
          readOnly={readOnly}
        />
      ) : selected?.type === PropertyType.DATE ? (
        <InputDate
          ref={dateInput}
          required={selected.isRequired}
          name={selected.name}
          title={t(selected.title)}
          value={dateValue}
          onChange={(e) => onChange(e)}
          className={className}
          readOnly={readOnly}
        />
      ) : selected?.type === PropertyType.ROLE ? (
        <div>
          <label htmlFor={"result-" + selected.name.toLowerCase().replace(" ", "")} className="block text-xs font-medium text-gray-700">
            Roles {selected.isRequired && <span className="text-red-500">*</span>}
          </label>
          TODO
          {/* <div className="mt-1"><FormRoleSelector ref={roleInput} formId={formId} selected={roles} onSelected={selectedRoles} /></div> */}
        </div>
      ) : selected?.type === PropertyType.USER ? (
        <div>
          <label htmlFor={"result-" + selected.name.toLowerCase().replace(" ", "")} className="block text-xs font-medium text-gray-700">
            User {selected.isRequired && <span className="text-red-500">*</span>}
          </label>
          <div className="mt-1">
            <UserSelector
              items={[]}
              ref={userInput}
              selected={user}
              onSelected={(e) => {
                setUser(e);
                setUserId(e.id);
              }}
            />
          </div>
        </div>
      ) : selected?.type === PropertyType.ENTITY ? (
        <div>
          <InputSelector
            name={selected.name}
            title={t(selected.title)}
            value={relatedRowId}
            setValue={(e) => onChange(e?.toString())}
            options={
              relatedEntity?.rows.map((f) => {
                return {
                  name: RowHelper.getRowFolio(relatedEntity.entity, f),
                  value: f.id,
                };
              }) ?? []
            }
            required={selected.isRequired}
            disabled={readOnly}
            // onNewRoute={`${relatedEntity?.entity.slug}/new`}
          />
        </div>
      ) : selected?.type === PropertyType.SELECT ? (
        <PropertyOptionSelector
          field={selected}
          initial={initialOption}
          parentSelectedValue={parentSelectedValue}
          onSelected={(e) => {
            onChange(e?.id ?? "");
            if (onChangeOption) {
              onChangeOption(e);
            }
          }}
          className={className}
          disabled={readOnly}
        />
      ) : selected?.type === PropertyType.BOOLEAN ? (
        <>
          <InputCheckbox
            asToggle={true}
            name={selected.name}
            title={t(selected.title)}
            required={selected.isRequired}
            value={booleanValue}
            setValue={(e) => onChange(e as boolean)}
            disabled={selected.isDefault}
            className={className}
            readOnly={readOnly}
          />
        </>
      ) : selected?.type === PropertyType.MEDIA ? (
        <PropertyMediaInput
          initialMedia={initialMedia}
          className={className}
          property={selected}
          disabled={readOnly}
          onSelected={(e) => setMedia(e)}
          readOnly={readOnly}
        />
      ) : (
        // ) : selected?.type === PropertyType.FORMULA ? (
        // <input
        //   ref={textInput}
        //   type="text"
        //   name="result"
        //   id="result"
        //   disabled
        //   className="bg-gray-100 cursor-not-allowed shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
        //               />
        <div className={className}>Not supported</div>
      )}
    </>
  );
};

export default forwardRef(RowValueInput);

import { EntityProperty, EntityPropertyOption, EntityRow, EntityRowValue, TenantUser, UserRole } from "@prisma/client";
import clsx from "clsx";
import { Ref, useImperativeHandle, useRef, useState, useEffect, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { EntityRowPropertyValueDto } from "~/application/dtos/entities/EntityRowPropertyValueDto";
import { EntityPropertyType } from "~/application/enums/entities/EntityPropertyType";
import { useAppData } from "~/utils/data/useAppData";
import { EntityPropertyWithDetails, EntityWithDetails } from "~/utils/db/entities.db.server";
import { EntityRowWithDetails } from "~/utils/db/entityRows.db.server";
import { TenantUserWithUser } from "~/utils/db/tenants.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import { RefRoleSelector } from "../core/roles/RoleSelector";
import UserSelector, { RefUserSelector } from "../core/users/UserSelector";
import InputDate, { RefInputDate } from "../ui/input/InputDate";
import InputNumber, { RefInputNumber } from "../ui/input/InputNumber";
import InputText, { RefInputText } from "../ui/input/InputText";
import EntityPropertyValueSelector from "./EntityPropertyValueSelector";
import { RefEntitySelector } from "./EntitySelector";
import RelatedEntityRowSelector from "./RelatedEntityRowSelector";

export interface RefEntityRowPropertyControl {
  focus: () => void;
}

interface Props {
  entity: EntityWithDetails;
  idValue: string | undefined;
  textValue: string | undefined;
  numberValue: number | undefined;
  dateValue: Date | undefined;
  selected: EntityPropertyWithDetails | undefined;
  relatedEntityRow?: EntityRow | undefined;
  initialOption?: EntityPropertyOption | undefined;
  parentSelectedValue: EntityRowPropertyValueDto | undefined;
  onChange: (value: string | number | Date | undefined | null) => void;
  onChangeRelatedRequest?: (related: EntityRow | undefined) => void;
  onChangeOption?: (option: EntityPropertyOption | undefined) => void;
  readOnly: boolean;
  className?: string;
  relatedEntity: { propertyId: string; entity: EntityWithDetails; rows: EntityRowWithDetails[] } | undefined;
}

const EntityRowPropertyControl = (
  {
    entity,
    selected,
    idValue,
    textValue,
    numberValue,
    dateValue,
    relatedEntityRow,
    initialOption,
    parentSelectedValue,
    onChange,
    onChangeRelatedRequest,
    onChangeOption,
    className,
    readOnly,
    relatedEntity,
  }: Props,
  ref: Ref<RefEntityRowPropertyControl>
) => {
  useImperativeHandle(ref, () => ({ focus }));

  const { t } = useTranslation();
  const numberInput = useRef<RefInputNumber>(null);
  const textInput = useRef<RefInputText>(null);
  const dateInput = useRef<RefInputDate>(null);
  const roleInput = useRef<RefRoleSelector>(null);
  const userInput = useRef<RefUserSelector>(null);
  // const formFieldInput = useRef<RefEntityPropertySelector>(null);
  const formInput = useRef<RefEntitySelector>(null);

  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState<UserRole[]>([]);
  const [userId, setUserId] = useState<string>();
  const [user, setUser] = useState<TenantUserWithUser>();
  const [formFieldOption, setEntityPropertyOption] = useState<EntityPropertyOption>();
  const [formField, setEntityProperty] = useState<EntityProperty>();
  const [related, setRelated] = useState<EntityRow>();
  const [formula, setFormula] = useState<string>("");

  const appData = useAppData();
  useEffect(() => {
    if (selected?.type === EntityPropertyType.ENTITY && selected.parentId) {
      // TODO
      // const item = appData.entities.find((f) => f.id === selected.parentId);
      // console.log({ selected, item })
      // if (item) {
      //   setEntityProperty(item);
      // }
      // services.forms.getField(selected.parentId).then((response) => {
      //   setEntityProperty(response);
      // });
    }
    if (selected?.type === EntityPropertyType.ENTITY) {
      setRelated(relatedEntityRow);
    }
    if (selected?.type === EntityPropertyType.SELECT) {
      // services.forms.getField(selected.id).then((response) => {
      //   setEntityProperty(response);
      // });
    }
  }, []);

  function focus() {
    if (selected?.type === EntityPropertyType.TEXT) {
      textInput.current?.input.current?.focus();
    } else if (selected?.type === EntityPropertyType.NUMBER) {
      numberInput.current?.input.current?.focus();
    } else if (selected?.type === EntityPropertyType.DATE) {
      dateInput.current?.input.current?.focus();
    } else if (selected?.type === EntityPropertyType.ENTITY) {
      formInput.current?.focus();
    } else if (selected?.type === EntityPropertyType.ROLE) {
      roleInput.current?.focus();
    } else if (selected?.type === EntityPropertyType.USER) {
      userInput.current?.focus();
    }
  }

  useEffect(() => {
    if (selected?.type === EntityPropertyType.ROLE) {
      onChange(roles.map((f) => f.id).join(","));
    }
  }, [roles]);

  useEffect(() => {
    if (selected?.type === EntityPropertyType.USER) {
      onChange(userId ?? undefined);
    }
  }, [userId]);

  useEffect(() => {
    if (selected?.type === EntityPropertyType.SELECT) {
      onChange(formFieldOption?.id ?? "");
      if (onChangeOption) {
        onChangeOption(formFieldOption);
      }
    }
  }, [formFieldOption]);

  useEffect(() => {
    if (selected?.type === EntityPropertyType.FORMULA) {
      onChange(formula);
    }
  }, [formula]);

  useEffect(() => {
    if (selected?.type === EntityPropertyType.ENTITY) {
      onChange(related?.id);
      if (onChangeRelatedRequest) {
        onChangeRelatedRequest(related);
      }
    }
  }, [related]);

  function selectedRoles(e: UserRole) {
    const item = roles.find((f) => f.id === e.id);
    if (item) {
      setRoles([...roles.filter((f) => f !== item)]);
    } else {
      setRoles([...roles, e]);
    }
  }

  return (
    <>
      {selected?.type === EntityPropertyType.TEXT ? (
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
      ) : selected?.type === EntityPropertyType.NUMBER ? (
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
      ) : selected?.type === EntityPropertyType.DATE ? (
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
      ) : selected?.type === EntityPropertyType.ROLE ? (
        <div>
          <label htmlFor={"result-" + selected.name.toLowerCase().replace(" ", "")} className="block text-xs font-medium text-gray-700">
            Roles {selected.isRequired && <span className="text-red-500">*</span>}
          </label>
          TODO
          {/* <div className="mt-1"><FormRoleSelector ref={roleInput} formId={formId} selected={roles} onSelected={selectedRoles} /></div> */}
        </div>
      ) : selected?.type === EntityPropertyType.USER ? (
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
      ) : selected?.type === EntityPropertyType.ENTITY ? (
        <div>
          <label htmlFor={"result-" + selected.name.toLowerCase().replace(" ", "")} className="block text-xs font-medium text-gray-700">
            {selected.title} {selected.isRequired && <span className="text-red-500">*</span>}
          </label>
          <div className="mt-1">
            {relatedEntity && (
              <RelatedEntityRowSelector
                name={selected.name}
                entity={relatedEntity.entity}
                items={relatedEntity.rows}
                selected={related}
                onSelected={(e) => setRelated(e)}
              />
            )}
          </div>
        </div>
      ) : selected?.type === EntityPropertyType.SELECT ? (
        <EntityPropertyValueSelector
          disabled={readOnly}
          field={selected}
          initial={initialOption}
          parentSelectedValue={parentSelectedValue}
          onSelected={(e) => {
            setEntityPropertyOption(e);
          }}
          className={className}
        />
      ) : (
        // ) : selected?.type === EntityPropertyType.FORMULA ? (
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

export default forwardRef(EntityRowPropertyControl);

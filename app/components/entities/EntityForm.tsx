import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@remix-run/react";
import InputText, { RefInputText } from "../ui/input/InputText";
import { useTranslation } from "react-i18next";
import InputGroup from "../ui/forms/InputGroup";
import EntityIcon from "../layouts/icons/EntityIcon";
import InputNumber from "../ui/input/InputNumber";
import InputCheckboxWithDescription from "../ui/input/InputCheckboxWithDescription";
import { Entity } from "@prisma/client";
import FormGroup from "../ui/forms/FormGroup";
import { useAdminData } from "~/utils/data/useAdminData";
import StringUtils from "~/utils/shared/StringUtils";
import { Visibility } from "~/application/dtos/shared/Visibility";
import InputSelect from "../ui/input/InputSelect";
import VisibilityHelper from "~/utils/helpers/VisibilityHelper";
import Constants from "~/application/Constants";

interface Props {
  item?: Entity | null;
  canDelete?: boolean;
}
export default function EntityForm({ item, canDelete }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const adminData = useAdminData();

  const inputName = useRef<RefInputText>(null);

  const [title, setTitle] = useState(item?.title ?? "");
  const [titlePlural, setTitlePlural] = useState(item?.titlePlural ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [icon, setIcon] = useState(
    item?.icon ??
      `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">   <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> </svg>`
  );
  const [order, setOrder] = useState(item?.order ?? (adminData.entities.length > 0 ? Math.max(...adminData.entities.map((o) => o.order)) : 0) + 1);
  const [prefix, setPrefix] = useState(item?.prefix ?? "");
  const [isFeature, setIsFeature] = useState(item?.isFeature ?? true);
  const [isAutogenerated, setIsAutogenerated] = useState(item?.isAutogenerated ?? true);
  const [hasApi, setHasApi] = useState(item?.hasApi ?? true);
  const [requiresLinkedAccounts, setRequiresLinkedAccounts] = useState(item?.requiresLinkedAccounts ?? false);
  const [active, setActive] = useState(item?.active ?? true);

  const [hasTags, setHasTags] = useState(item?.hasTags ?? true);
  const [hasComments, setHasComments] = useState(item?.hasComments ?? true);
  const [hasTasks, setHasTasks] = useState(item?.hasTasks ?? true);
  const [hasWorkflow, setHasWorkflow] = useState(item?.hasWorkflow ?? false);

  const [defaultVisibility, setDefaultVisibility] = useState<string | number | undefined>(item?.defaultVisibility ?? Constants.DEFAULT_ROW_VISIBILITY);

  useEffect(() => {
    setTimeout(() => {
      inputName.current?.input.current?.focus();
    }, 100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (!item) {
  //     const slug = UrlUtils.slugify(t(titlePlural), 100);
  //     setSlug(slug);
  //     if (titlePlural.length >= 3) {
  //       setPrefix(t(titlePlural).substring(0, 3).toUpperCase());
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [titlePlural]);

  useEffect(() => {
    if (!item) {
      const title = StringUtils.capitalize(name.toLowerCase());
      if (title) {
        setTitle(title);
        setPrefix(t(title).substring(0, 3).toUpperCase());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (!item) {
      setTitlePlural(StringUtils.capitalize(slug.toLowerCase()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <FormGroup id={item?.id} onCancel={() => navigate("/admin/entities")} editing={true} canDelete={canDelete}>
      <InputGroup title="Entity Details">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <InputText
            ref={inputName}
            className="col-span-6"
            name="name"
            title={t("models.entity.name")}
            value={name}
            setValue={setName}
            required
            help="eg: contract"
            autoComplete="off"
          />

          <InputText
            className="col-span-6"
            name="slug"
            title={t("models.entity.slug")}
            value={slug}
            setValue={setSlug}
            required
            autoComplete="off"
            help="eg: contracts would show at /app/:tenant/contracts"
            lowercase={true}
          />
          <InputText
            className="col-span-6"
            name="title"
            title={t("models.entity.title")}
            value={title}
            setValue={setTitle}
            required
            autoComplete="off"
            help="Object title, eg: Contract"
            withTranslation
          />
          <InputText
            className="col-span-6"
            name="title-plural"
            title={t("models.entity.titlePlural")}
            value={titlePlural}
            setValue={setTitlePlural}
            required
            autoComplete="off"
            help="eg: Contracts"
            withTranslation
          />
        </div>
      </InputGroup>

      <InputGroup title="Display">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <InputNumber
            className="sm:col-span-4"
            name="order"
            title={t("models.entity.order")}
            value={order}
            setValue={setOrder}
            disabled={!item}
            min={1}
            max={99}
            required
            help="Order of display on the /app/:tenant sidebar menu"
            // readOnly={item === undefined}
          />

          <InputText
            className="sm:col-span-4"
            name="prefix"
            title={t("models.entity.prefix")}
            value={prefix}
            setValue={setPrefix}
            minLength={2}
            maxLength={5}
            uppercase
            required
            help="Folio prefix, eg: EMP-0001, EMP-0002..."
          />

          <InputSelect
            className="sm:col-span-4"
            name="default-visibility"
            title={`Default visibility`}
            value={defaultVisibility}
            setValue={setDefaultVisibility}
            options={[
              {
                name: VisibilityHelper.getVisibilityTitle(t, Visibility.Private),
                value: Visibility.Private,
              },
              {
                name: VisibilityHelper.getVisibilityTitle(t, Visibility.Tenant),
                value: Visibility.Tenant,
              },
              {
                name: VisibilityHelper.getVisibilityTitle(t, Visibility.Public),
                value: Visibility.Public,
              },
            ]}
          />

          <InputText
            className="col-span-12"
            name="icon"
            title={t("models.entity.icon")}
            required
            value={icon}
            setValue={setIcon}
            hint={<div className="text-gray-400">SVG or image URL sidebar icon</div>}
            button={
              <div className="absolute inset-y-0 right-0 flex py-0.5 pr-0.5 ">
                <kbd className="w-10 text-center bg-gray-50 inline-flex items-center border border-gray-300 rounded px-1 text-xs font-sans font-medium text-gray-500 justify-center">
                  {icon ? <EntityIcon className="h-7 w-7 text-gray-600" icon={icon} title={title} /> : <span className="text-red-600">?</span>}
                </kbd>
              </div>
            }
          />
        </div>
      </InputGroup>

      <InputGroup title="Preferences">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="divide-y divide-gray-200 col-span-12">
            <InputCheckboxWithDescription
              className="col-span-12"
              name="is-feature"
              title={t("models.entity.isFeature")}
              value={isFeature}
              setValue={setIsFeature}
              description="It counts as a plan feature, with its limits (eg: 100 contracts/month)."
            />
            <InputCheckboxWithDescription
              className="col-span-12"
              name="has-api"
              title={t("models.entity.hasApi")}
              value={hasApi}
              setValue={setHasApi}
              description={`Generates entity API at /api/${slug ?? "entity-name"}, with end-user API keys and quota.`}
            />
            <InputCheckboxWithDescription
              className="col-span-12"
              name="is-autogenerated"
              title={t("models.entity.isAutogenerated")}
              value={isAutogenerated}
              setValue={setIsAutogenerated}
              description="Is visible in tenant's sidebar at /app/:tenant."
            />
            <InputCheckboxWithDescription
              className="col-span-12"
              name="active"
              title={t("models.entity.active")}
              value={active}
              setValue={setActive}
              description="SaaS users can use this entity"
            />
            <InputCheckboxWithDescription
              className="col-span-12"
              name="requires-account-link"
              title={t("models.entity.requiresLinkedAccounts")}
              value={requiresLinkedAccounts}
              setValue={setRequiresLinkedAccounts}
              description="A linked account must be set (eg: A contract requires a Provider and a Client accounts to be linked at /app/:tenant/settings/linked-accounts)."
            />

            <InputCheckboxWithDescription
              className="col-span-12"
              name="has-tags"
              title={t("models.entity.hasTags")}
              value={hasTags}
              setValue={setHasTags}
              description="Tags enabled"
            />
            <InputCheckboxWithDescription
              className="col-span-12"
              name="has-comments"
              title={t("models.entity.hasComments")}
              value={hasComments}
              setValue={setHasComments}
              description="Comments enabled"
            />
            <InputCheckboxWithDescription
              className="col-span-12"
              name="has-tasks"
              title={t("models.entity.hasTasks")}
              value={hasTasks}
              setValue={setHasTasks}
              description="Tasks enabled"
            />
            <InputCheckboxWithDescription
              className="col-span-12"
              name="has-workflow"
              title={t("models.entity.hasWorkflow")}
              value={hasWorkflow}
              setValue={setHasWorkflow}
              description="Workflow enabled"
            />
          </div>
        </div>
      </InputGroup>
    </FormGroup>
  );
}

import clsx from "clsx";
import { forwardRef, Ref, RefObject, useEffect, useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";

export interface RefInputDate {
  input: RefObject<HTMLInputElement>;
}

interface Props {
  name: string;
  title: string;
  value?: string;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  help?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  withTranslation?: boolean;
  translationParams?: string[];
}
const InputDate = (
  {
    name,
    title,
    value,
    setValue,
    className,
    help,
    disabled = false,
    required = false,
    minLength,
    maxLength,
    autoComplete,
    withTranslation = false,
    translationParams = [],
  }: Props,
  ref: Ref<RefInputDate>
) => {
  const { t, i18n } = useTranslation();

  useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);

  function getTranslation(value: string) {
    if (!i18n.exists(value)) {
      return null;
    }
    return t(value);
  }

  return (
    <div className={className}>
      <label htmlFor={name} className="flex justify-between space-x-2 text-xs font-medium text-gray-600 truncate">
        <div className=" flex space-x-1 items-center">
          <div>
            {title}
            {required && <span className="ml-1 text-red-500">*</span>}
          </div>

          {help && <HintTooltip text={help} />}
        </div>
        {withTranslation && value?.includes(".") && (
          <div className="text-slate-600 font-light italic">
            {t("admin.pricing.i18n")}:{" "}
            {getTranslation(value) ? (
              <span className="text-slate-600">{t(value, translationParams ?? [])}</span>
            ) : (
              <span className="text-red-600">{t("shared.invalid")}</span>
            )}
          </div>
        )}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm w-full">
        <input
          ref={input}
          type="date"
          id={name}
          name={name}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          value={value}
          onChange={(e) => (setValue ? setValue(e.currentTarget.value) : {})}
          disabled={disabled}
          className={clsx(
            "w-full flex-1 focus:ring-accent-500 focus:border-accent-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
            className,
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );
};
export default forwardRef(InputDate);

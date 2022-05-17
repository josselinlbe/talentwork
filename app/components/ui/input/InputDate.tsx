import clsx from "clsx";
import { forwardRef, Ref, RefObject, useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";

export interface RefInputDate {
  input: RefObject<HTMLInputElement>;
}

interface Props {
  name: string;
  title: string;
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  help?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoComplete?: string;
}
const InputDate = (
  { name, title, value, onChange, className, help, disabled = false, readOnly = false, required = false, minLength, maxLength, autoComplete }: Props,
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
          value={value ? new Date(value).toISOString().split("T")[0] : ""}
          onChange={(e) => (onChange ? onChange(e.target.valueAsDate || new Date()) : {})}
          disabled={disabled}
          readOnly={readOnly}
          className={clsx(
            "w-full flex-1 focus:ring-accent-500 focus:border-accent-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
            className,
            (disabled || readOnly) && "bg-gray-100 cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );
};
export default forwardRef(InputDate);

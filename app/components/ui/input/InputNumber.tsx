import clsx from "clsx";
import { forwardRef, ReactNode, Ref, RefObject, useImperativeHandle, useRef } from "react";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";

export interface RefInputNumber {
  input: RefObject<HTMLInputElement>;
}

interface Props {
  name: string;
  title: string;
  withLabel?: boolean;
  value?: number;
  setValue?: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
  help?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hint?: ReactNode;
  step?: string;
  placeholder?: string;
  icon?: string;
}
const InputNumber = (
  {
    name,
    title,
    withLabel = true,
    value,
    setValue,
    className,
    hint,
    help,
    disabled = false,
    readOnly = false,
    required = false,
    min = 0,
    max,
    step,
    placeholder,
    icon,
  }: Props,
  ref: Ref<RefInputNumber>
) => {
  useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={className}>
      {withLabel && (
        <label htmlFor={name} className="flex justify-between space-x-2 text-xs font-medium text-gray-600">
          <div className=" flex space-x-1 items-center">
            <div className="truncate">
              {title}
              {required && <span className="ml-1 text-red-500">*</span>}
            </div>

            {help && <HintTooltip text={help} />}
          </div>
          {hint}
        </label>
      )}
      <div className={clsx("flex rounded-md w-full relative", withLabel && "mt-1")}>
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EntityIcon className="h-5 w-5 text-gray-400" icon={icon} />
          </div>
        )}
        <input
          ref={input}
          type="number"
          id={name}
          name={name}
          required={required}
          min={min}
          max={max}
          value={value ?? ""}
          step={step}
          placeholder={placeholder}
          onChange={(e) => (setValue ? setValue(Number(e.currentTarget.value)) : {})}
          disabled={disabled}
          readOnly={readOnly}
          className={clsx(
            "w-full flex-1 focus:ring-accent-500 focus:border-accent-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
            className,
            (disabled || readOnly) && "bg-gray-100 cursor-not-allowed",
            icon && "pl-10"
          )}
        />
      </div>
    </div>
  );
};
export default forwardRef(InputNumber);

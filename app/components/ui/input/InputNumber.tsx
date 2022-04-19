import clsx from "clsx";
import { forwardRef, ReactNode, Ref, RefObject, useImperativeHandle, useRef } from "react";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";

export interface RefInputNumber {
  input: RefObject<HTMLInputElement>;
}

interface Props {
  name: string;
  title: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
  help?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
  hint?: ReactNode;
}
const InputNumber = (
  { name, title, value, setValue, className, hint, help, disabled = false, required = false, min, max }: Props,
  ref: Ref<RefInputNumber>
) => {
  useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <label htmlFor={name} className="flex justify-between space-x-2 text-xs font-medium text-gray-600 truncate">
        <div className=" flex space-x-1 items-center">
          <div className={className}>
            {title}
            {required && <span className="ml-1 text-red-500">*</span>}
          </div>

          {help && <HintTooltip text={help} />}
        </div>
        {hint}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm w-full">
        <input
          ref={input}
          type="number"
          id={name}
          name={name}
          required={required}
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.currentTarget.value))}
          disabled={disabled}
          className={clsx(
            "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
            className,
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      </div>
    </>
  );
};
export default forwardRef(InputNumber);

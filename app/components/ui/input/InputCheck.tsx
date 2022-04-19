import clsx from "clsx";
import { forwardRef, ReactNode, Ref, RefObject, useImperativeHandle, useRef } from "react";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";

export interface RefInputCheckbox {
  input: RefObject<HTMLInputElement>;
}

interface Props {
  name: string;
  title: string;
  value: boolean;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  description?: ReactNode;
}
const InputCheckbox = ({ name, title, value, setValue, description, className, help, required, disabled = false }: Props, ref: Ref<RefInputCheckbox>) => {
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
      </label>
      <div className="mt-1 flex rounded-md w-full h-8">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={value}
          onChange={(e) => {
            setValue(e.target.checked);
          }}
          disabled={disabled}
          className={clsx(" mt-1 cursor-pointer focus:ring-theme-500 h-6 w-6 text-theme-600 border-gray-300 rounded", className)}
        />
      </div>
    </>
  );
};
export default forwardRef(InputCheckbox);

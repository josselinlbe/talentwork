import clsx from "~/utils/shared/ClassesUtils";

interface Props {
  name: string;
  title: string;
  options: { name: string; value: string | number | readonly string[] | undefined }[];
  value?: string | number | readonly string[] | undefined;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}
export default function InputSelect({ name, title, value, options, setValue, className, required, disabled }: Props) {
  return (
    <div className={clsx(className, "flex-grow w-full")}>
      <label htmlFor={name} className="block text-xs font-medium text-gray-700 truncate">
        <div>
          {title}
          {required && <span className="ml-1 text-red-500">*</span>}
        </div>
      </label>
      <div className="mt-1">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => (setValue ? setValue(e.currentTarget.value) : {})}
          className={clsx("shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md", className)}
          disabled={disabled}
        >
          {options.map((item, idx) => {
            return (
              <option key={idx} value={item.value}>
                {item.name}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

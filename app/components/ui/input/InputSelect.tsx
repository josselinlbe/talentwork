import clsx from "~/utils/shared/ClassesUtils";

interface Props {
  name: string;
  title: string;
  value: string | number | readonly string[] | undefined;
  options: { name: string; value: string | number | readonly string[] | undefined }[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  className?: string;
}
export default function InputSelect({ name, title, value, options, onChange, className }: Props) {
  return (
    <div className="flex-grow">
      <label htmlFor={name} className="block text-xs font-medium text-gray-700 truncate">
        <div className={className}>{title}</div>
      </label>
      <div className="mt-1">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={clsx("shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md", className)}
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

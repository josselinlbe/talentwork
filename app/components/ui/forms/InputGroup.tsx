import { ReactNode } from "react";

interface Props {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}
export default function InputGroup({ title, icon, children }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm leading-3 font-bold text-gray-800">
        <div className="flex space-x-1 items-center">
          {icon}
          <div>
            <span className=" italic font-light"></span> {title}
          </div>
        </div>
      </h3>
      <div className="bg-white py-5 px-4 shadow border border-gray-100 rounded-md">{children}</div>
    </div>
  );
}

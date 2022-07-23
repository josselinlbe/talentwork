import { ReactNode } from "react";
import Tabs, { TabItem } from "../tabs/Tabs";

interface Props {
  title?: ReactNode;
  buttons?: ReactNode;
  children: ReactNode;
  tabs?: TabItem[];
  replaceTitleWithTabs?: boolean;
}
export default function IndexPageLayout({ title, buttons, children, tabs, replaceTitleWithTabs }: Props) {
  return (
    <>
      {(title || buttons || (replaceTitleWithTabs && tabs)) && (
        <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
          <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
            {replaceTitleWithTabs && tabs ? (
              <Tabs tabs={tabs} className="flex-grow" />
            ) : (
              <div className="flex-1 font-bold flex items-center truncate">{title}</div>
            )}
            {buttons && <div className="flex items-center space-x-2">{buttons}</div>}
          </div>
        </div>
      )}
      {tabs && !replaceTitleWithTabs && (
        <div className="w-full py-2">
          <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
            <Tabs tabs={tabs} className="flex-grow" />
          </div>
        </div>
      )}
      <div className="pt-2 pb-6 space-y-2 max-w-5xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </>
  );
}

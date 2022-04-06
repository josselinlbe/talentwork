import { useAppData } from "~/utils/data/useAppData";

export default function TenantSelect() {
  const appData = useAppData();
  return (
    <button type="button" className="group flex-shrink-0 flex bg-gray-700 p-4">
      <div className="flex-shrink-0 w-full group block">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-left trunc">
            <div>
              {/* <img
                    className="inline-block h-9 w-9 rounded-full"
                    src="{https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80}"
                    alt=""
                  /> */}
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-theme-500">
                <span className="text-sm font-medium leading-none text-white">{appData.currentTenant?.name.substring(0, 1)}</span>
              </span>
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-gray-200 group-hover:text-white">{appData.currentTenant?.name}</p>
              <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200 truncate">{appData.user?.email}</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}

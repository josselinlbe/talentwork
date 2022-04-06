import { useEffect, useState } from "react";
import { useAppData } from "~/utils/data/useAppData";
import ChangeWorkspaceCommandPalette from "./ChangeWorkspaceCommandPalette";

export default function TenantSelect() {
  const appData = useAppData();
  const [showChangeTenant, setShowChangeTenant] = useState(false);
  function open() {
    setShowChangeTenant(true);
  }

  useEffect(() => {
    function onKeydown(event: any) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        setShowChangeTenant(true);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [setShowChangeTenant]);

  return (
    <>
      <button type="button" onClick={open} className="group flex-shrink-0 flex bg-slate-800 p-4 focus:outline-none">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-left truncate">
              {/*  */}
              {appData.currentTenant?.icon ? (
                <img className="inline-block h-9 w-9 rounded-full bg-gray-500 shadow-sm" src={appData.currentTenant?.icon} alt="Tenant icon" />
              ) : (
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-theme-900">
                  <span className="text-sm font-medium leading-none text-theme-200">{appData.currentTenant?.name.substring(0, 1)}</span>
                </span>
              )}
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-gray-200 group-hover:text-white">{appData.currentWorkspace?.name}</p>
                <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200 truncate">{appData.currentTenant?.name}</p>
              </div>
              {/* <span className="ml-3 flex-none text-xs font-semibold text-gray-400">
                <kbd className="font-sans">⌘</kbd>
                <kbd className="font-sans">K</kbd>
              </span> */}
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
      {showChangeTenant && <ChangeWorkspaceCommandPalette isOpen={showChangeTenant} onClose={() => setShowChangeTenant(false)} />}
    </>
  );
}

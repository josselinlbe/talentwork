import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";

export default function PreviewBreadcrumbs() {
  const currentRoute = useLocation().pathname;
  return (
    <div id="breadcrumbs" className="space-y-6 w-full">
      <div className="space-y-1">
        <h3 className="font-medium text-sm">Breadcrumbs</h3>
        <div className="flex items-center space-x-2 p-2 border-dashed border-gray-300 border">
          <Breadcrumb
            className="w-full"
            home="/"
            menu={[{ title: "Home", routePath: "/" }, { title: "Components", routePath: currentRoute }, { title: "Breadcrumbs" }]}
          />
        </div>
      </div>
    </div>
  );
}

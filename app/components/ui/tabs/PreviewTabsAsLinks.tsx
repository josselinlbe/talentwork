import { useLocation } from "@remix-run/react";
import Tabs from "./Tabs";

export default function PreviewTabsAsLinks() {
  const currentRoute = useLocation().pathname;
  return (
    <div className="space-y-2 w-full">
      <Tabs
        asLinks={true}
        className="w-full sm:w-auto"
        tabs={[
          { name: "Home", routePath: "/" },
          { name: "Components", routePath: currentRoute },
        ]}
      />
    </div>
  );
}

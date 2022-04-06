import { ReactNode } from "react";
import SidebarLayout from "../layouts/SidebarLayout";
import { useAppData } from "~/utils/data/useAppData";

interface Props {
  layout: "app" | "admin";
  children: ReactNode;
}

export default function AppLayout({ layout, children }: Props) {
  const appData = useAppData();

  return (
    <div key={appData.currentWorkspace?.id}>
      <SidebarLayout layout={layout}>{children}</SidebarLayout>
    </div>
  );
}

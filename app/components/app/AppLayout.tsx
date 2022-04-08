import { ReactNode, useState } from "react";
import SidebarLayout from "../layouts/SidebarLayout";
import { useAppData } from "~/utils/data/useAppData";
import AppCommandPalette from "../ui/commandPalettes/AppCommandPalette";

interface Props {
  layout: "app" | "admin";
  children: ReactNode;
}

export default function AppLayout({ layout, children }: Props) {
  const appData = useAppData();

  const [showCommandPalette, setShowCommandPalette] = useState(false);

  return (
    <div key={appData.currentWorkspace?.id}>
      <SidebarLayout layout={layout} onOpenCommandPalette={() => setShowCommandPalette(true)}>
        {children}
      </SidebarLayout>
      {layout === "app" ? (
        <AppCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : (
        <div></div>
        // <AppCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      )}
    </div>
  );
}

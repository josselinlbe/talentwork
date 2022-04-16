import { ReactNode, useEffect, useState } from "react";
import SidebarLayout from "../layouts/SidebarLayout";
import AppCommandPalette from "../ui/commandPalettes/AppCommandPalette";
import AdminCommandPalette from "../ui/commandPalettes/AdminCommandPalette";

interface Props {
  layout: "app" | "admin";
  children: ReactNode;
}

export default function AppLayout({ layout, children }: Props) {
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    function onKeydown(event: any) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        setShowCommandPalette(true);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, []);

  return (
    <div>
      <SidebarLayout layout={layout} onOpenCommandPalette={() => setShowCommandPalette(true)}>
        {children}
      </SidebarLayout>
      {layout === "app" ? (
        <AppCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : (
        <AdminCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      )}
    </div>
  );
}

import { ReactNode, useEffect, useState } from "react";
import SidebarLayout from "../layouts/SidebarLayout";
import AppCommandPalette from "../ui/commandPalettes/AppCommandPalette";
import AdminCommandPalette from "../ui/commandPalettes/AdminCommandPalette";
import DocsCommandPalette from "../ui/commandPalettes/DocsCommandPalette";
import { Command } from "~/application/dtos/layout/Command";

interface Props {
  layout: "app" | "admin" | "docs";
  children: ReactNode;
  commands?: Command[];
}

export default function AppLayout({ layout, children, commands }: Props) {
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
      ) : layout === "admin" ? (
        <AdminCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : layout === "docs" && commands ? (
        <DocsCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} defaultCommands={commands} />
      ) : (
        <div></div>
      )}
    </div>
  );
}

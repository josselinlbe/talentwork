import clsx from "clsx";
import { useEffect, useState } from "react";
import { useSearchParams } from "@remix-run/react";
import TableIcon from "../icons/TableIcon";
import ViewBoardsIcon from "../icons/ViewBoardsIcon";

interface Props {
  defaultView?: "table" | "board";
  className?: string;
}
export default function ViewToggleWithUrl({ defaultView, className }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get("view") ?? defaultView ?? "table");

  useEffect(() => {
    const view = searchParams.get("view");
    if (view) {
      setView(view);
    }
  }, [searchParams]);

  // useEffect(() => {
  //   searchParams.set("view", view);
  //   setSearchParams(searchParams);
  // }, [view]);

  function onChange(value: "table" | "board") {
    searchParams.set("view", value);
    setSearchParams(searchParams);
  }
  return (
    <span className={clsx("relative z-0 inline-flex shadow-sm rounded-md", className)}>
      <button
        onClick={() => onChange("table")}
        type="button"
        className={clsx(
          "relative inline-flex items-center px-4 py-2.5 rounded-l-md border border-gray-300 sm:text-sm font-medium hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500",
          view === "table" ? "bg-accent-100 text-accent-500" : "bg-white text-gray-700"
        )}
      >
        <TableIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("board")}
        type="button"
        className={clsx(
          "-ml-px relative inline-flex items-center px-4 py-2.5 rounded-r-md border border-gray-300 text-sm font-medium hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500",
          view === "board" ? "bg-accent-100 text-accent-500" : "bg-white text-gray-700"
        )}
      >
        <ViewBoardsIcon className="h-4 w-4" />
      </button>
    </span>
  );
}

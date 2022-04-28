import { useLocation } from "react-router-dom";
import EmptyState from "./EmptyState";

export default function PreviewEmptyStates() {
  const currentRoute = useLocation().pathname;
  return (
    <div id="empty-states" className="space-y-1">
      <h3 className="font-medium text-sm">Empty States</h3>
      <div className="bg-white p-6 border-dashed border-gray-300 border">
        <div className="space-y-2 w-full">
          <EmptyState
            onClick={() => alert("Clicked")}
            captions={{
              new: "Button",
              thereAreNo: "There are no...",
              description: "Description...",
            }}
            icon="plus"
          />
          <EmptyState
            to={currentRoute}
            captions={{
              new: "Link",
              thereAreNo: "There are no...",
              description: "Description...",
            }}
          />
        </div>
      </div>
    </div>
  );
}

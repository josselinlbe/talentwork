import clsx from "clsx";
import { Colors } from "~/application/enums/shared/Colors";
import { getBadgeColor } from "~/utils/shared/ColorUtils";

interface Props {
  title: string;
  color: Colors;
  className?: string;
}

export default function SimpleBadge({ title, color, className }: Props) {
  return <div className={clsx(className, "inline-flex items-center px-1 py-0 rounded-md text-xs font-bold", getBadgeColor(color))}>{title}</div>;
}

import { Colors } from "~/application/enums/shared/Colors";

export function getTailwindColor(itemColor: Colors): string {
  switch (itemColor) {
    case Colors.UNDEFINED:
      return "text-gray-500";
    case Colors.BLUE_GRAY:
      return "text-slate-500";
    case Colors.COOL_GRAY:
      return "text-gray-500";
    case Colors.GRAY:
      return "text-gray-500";
    case Colors.TRUE_GRAY:
      return "text-neutral-500";
    case Colors.WARM_GRAY:
      return "text-stone-500";
    case Colors.RED:
      return "text-red-500";
    case Colors.ORANGE:
      return "text-orange-500";
    case Colors.ORANGE:
      return "text-amber-500";
    case Colors.YELLOW:
      return "text-yellow-500";
    case Colors.LIME:
      return "text-lime-500";
    case Colors.GREEN:
      return "text-green-500";
    case Colors.EMERALD:
      return "text-emerald-500";
    case Colors.TEAL:
      return "text-teal-500";
    case Colors.CYAN:
      return "text-cyan-500";
    case Colors.LIGHT_BLUE:
      return "text-sky-500";
    case Colors.BLUE:
      return "text-blue-500";
    case Colors.INDIGO:
      return "text-indigo-500";
    case Colors.VIOLET:
      return "text-violet-500";
    case Colors.PURPLE:
      return "text-purple-500";
    case Colors.PINK:
      return "text-pink-500";
    case Colors.ROSE:
      return "text-rose-500";
    default:
      return "";
  }
}

export const colors = [
  {
    name: "GRAY",
    id: 3,
  },
  {
    name: "BLUE_GRAY",
    id: 1,
  },
  {
    name: "RED",
    id: 6,
  },
  {
    name: "ORANGE",
    id: 7,
  },
  {
    name: "AMBER",
    id: 8,
  },
  {
    name: "YELLOW",
    id: 9,
  },
  {
    name: "LIME",
    id: 10,
  },
  {
    name: "GREEN",
    id: 11,
  },
  {
    name: "EMERALD",
    id: 12,
  },
  {
    name: "TEAL",
    id: 13,
  },
  {
    name: "CYAN",
    id: 14,
  },
  {
    name: "LIGHT_BLUE",
    id: 15,
  },
  {
    name: "BLUE",
    id: 16,
  },
  {
    name: "INDIGO",
    id: 17,
  },
  {
    name: "VIOLET",
    id: 18,
  },
  {
    name: "PURPLE",
    id: 19,
  },
  {
    name: "PINK",
    id: 20,
  },
  {
    name: "ROSE",
    id: 21,
  },
];

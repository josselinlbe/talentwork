import { Link } from "@remix-run/react";
import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";

interface Props {
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  to?: string;
  target?: string;
  disabled?: boolean;
  destructive?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function ButtonPrimary({ className = "", type = "button", onClick, disabled, destructive, to, target, children }: Props) {
  return (
    <span>
      {(() => {
        if (!to) {
          return (
            <button
              onClick={onClick}
              type={type}
              disabled={disabled}
              className={clsx(
                className,
                "inline-flex items-center space-x-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-300",
                disabled && "cursor-not-allowed opacity-75",
                !destructive && "bg-theme-800",
                destructive && "bg-red-600",
                !disabled && !destructive && "hover:bg-theme-900 focus:ring-theme-500 hover:text-accent-100",
                !disabled && destructive && "hover:bg-red-700 focus:ring-red-500"
              )}
            >
              {children}
            </button>
          );
        } else {
          return (
            <Link
              to={to}
              target={target}
              className={clsx(
                className,
                "inline-flex items-center space-x-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-300",
                disabled && "cursor-not-allowed opacity-75",
                !destructive && "bg-theme-800",
                destructive && "bg-red-600",
                !disabled && !destructive && "hover:bg-theme-900 focus:ring-theme-500 hover:text-accent-100",
                !disabled && destructive && "hover:bg-red-700 focus:ring-red-500"
              )}
            >
              {children}
            </Link>
          );
        }
      })()}
    </span>
  );
}

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

export default function ButtonTertiary({ className = "", type = "button", onClick, disabled, destructive, to, target, children }: Props) {
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
                "border-b border-transparent inline-flex space-x-2 items-center mx-1 my-2 text-sm font-medium focus:outline-none",
                disabled ? "cursor-not-allowed opacity-75" : "hover:border-dotted",
                !destructive && "text-theme-700 border-b border-dashed border-accent-300",
                destructive && "text-red-600",
                !disabled && !destructive && "hover:text-theme-800 focus:text-theme-900 hover:border-accent-300",
                !disabled && destructive && "hover:text-red-800 focus:text-red-900 hover:border-red-300"
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
                "border-b border-transparent inline-flex space-x-2 items-center mx-1 my-2 text-sm font-medium focus:outline-none",
                disabled ? "cursor-not-allowed opacity-75" : " hover:border-dotted",
                !destructive && "text-theme-700 border-b border-dashed border-accent-300",
                destructive && "text-red-600",
                !disabled && !destructive && "hover:text-theme-800 focus:text-theme-900 hover:border-accent-300",
                !disabled && destructive && "hover:text-red-800 focus:text-red-900 hover:border-red-300"
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

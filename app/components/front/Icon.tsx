import IconLight from "../../assets/img/icon-light.png";
import IconDark from "../../assets/img/icon-dark.png";
import clsx from "clsx";
import { Link } from "@remix-run/react";

interface Props {
  className?: string;
  size?: string;
}

export default function Icon({ className = "", size = "h-9" }: Props) {
  return (
    <Link to="/" className={clsx(className, "flex")}>
      <img className={clsx(size, "hidden dark:block w-auto mx-auto")} src={IconDark} alt="Logo" />
      <img className={clsx(size, "dark:hidden w-auto mx-auto")} src={IconLight} alt="Logo" />
    </Link>
  );
}

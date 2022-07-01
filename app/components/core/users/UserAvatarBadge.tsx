import clsx from "clsx";

interface Props {
  item: { avatar: string | null } | null;
  className?: string;
}
export default function UserAvatarBadge({ item, className = "h-10 w-10" }: Props) {
  return (
    <div>
      {item?.avatar ? (
        <img className={clsx("rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-gray-50", className)} src={item.avatar} alt="Avatar" />
      ) : (
        <span className={clsx("inline-block rounded-full overflow-hidden bg-gray-100", className)}>
          <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
      )}
    </div>
  );
}

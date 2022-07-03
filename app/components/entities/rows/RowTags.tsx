import { Entity } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "@remix-run/react";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TagFilledIcon from "~/components/ui/icons/TagFilledIcon";
import XIcon from "~/components/ui/icons/XIcon";
import { RowTagWithDetails } from "~/utils/db/entities/rowTags.db.server";
import { getBackgroundColor } from "~/utils/shared/ColorUtils";

interface Props {
  entity: Entity;
  items: RowTagWithDetails[];
  withLink?: boolean;
  onRemove?: (item: RowTagWithDetails) => void;
}

export default function RowTags({ entity, items, withLink = true, onRemove }: Props) {
  const { t } = useTranslation();
  const data = useLoaderData<{ entityRowsRoute: string }>();

  const sortedItems = () => {
    return items.slice().sort((x, y) => {
      if (x.tag.value && y.tag.value) {
        return x.tag.value > y.tag.value ? -1 : 1;
      }
      return -1;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h3 className="text-sm leading-3 font-medium text-gray-800">
          <div className="flex space-x-1 items-center">
            <TagFilledIcon className="h-4 w-4 text-gray-400" />
            <div>
              <span className=" italic font-light"></span> {t("models.tag.plural")}
            </div>
          </div>
        </h3>
        {items.length > 0 && (
          <div className="text-xs inline">
            <Link to="tags" className="flex items-center space-x-1 text-gray-500 text-sm hover:underline">
              <PlusIcon className="h-3 w-3" />
              <div>{t("shared.setTags")}</div>
            </Link>
          </div>
        )}
      </div>

      {items.length === 0 && (
        <Link
          to="tags"
          className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {/* <TagFilledIcon className="h-4 mx-auto text-gray-500" /> */}
          <span className="block text-xs font-normal text-gray-500">{t("shared.noTags")}</span>
        </Link>
      )}
      <ul className="leading-8">
        {sortedItems().map((item) => {
          return (
            <li key={item.tag.value} className="inline">
              {withLink ? (
                <Link
                  to={`${data.entityRowsRoute}?tag=${item.tag.value}`}
                  className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5"
                >
                  <div className="absolute flex-shrink-0 flex items-center justify-center">
                    <span className={clsx("h-1.5 w-1.5 rounded-full", getBackgroundColor(item.tag.color))} aria-hidden="true" />
                  </div>
                  <div className="ml-3.5 text-sm font-medium text-gray-900">{item.tag.value}</div>
                </Link>
              ) : (
                <span className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5">
                  <div className="absolute flex-shrink-0 flex items-center justify-center">
                    <span className={clsx("h-1.5 w-1.5 rounded-full", getBackgroundColor(item.tag.color))} aria-hidden="true" />
                  </div>
                  <div className="ml-3.5 text-sm font-medium text-gray-900">{item.tag.value}</div>
                  {onRemove && (
                    <div className="absolute flex-shrink-0 flex items-center justify-center">
                      <XIcon className="h-3 w-3"></XIcon>
                    </div>
                  )}
                </span>
              )}{" "}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

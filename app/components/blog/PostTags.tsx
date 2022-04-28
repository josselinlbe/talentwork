import { BlogPostTag, BlogTag } from "@prisma/client";
import { getTailwindColor } from "~/utils/shared/ColorUtils";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  items: (BlogPostTag & { tag: BlogTag })[];
}
export default function PostTags({ items }: Props) {
  return (
    <div className="flex space-x-1 text-xs items-center">
      {items.map((blogTag, idx) => {
        return (
          <div key={idx}>
            <span className={getTailwindColor(blogTag.tag.color)}> #</span>
            {blogTag.tag.name}
          </div>
        );
      })}
    </div>
  );
}

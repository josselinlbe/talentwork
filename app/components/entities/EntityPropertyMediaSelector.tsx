import { Media } from "@prisma/client";
import { useEffect, useState } from "react";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { FileBase64 } from "~/application/dtos/shared/FileBase64";
import { EntityPropertyWithDetails } from "~/utils/db/entities.db.server";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
import MediaItem from "../ui/uploaders/MediaItem";
import UploadDocuments from "../ui/uploaders/UploadDocument";

interface Props {
  initialMedia: Media[] | undefined;
  property: EntityPropertyWithDetails;
  disabled?: boolean;
  onSelected: (item: MediaDto[]) => void;
  className?: string;
  readOnly?: boolean;
}
export default function EntityPropertyMediaSelector({ initialMedia, property, disabled, onSelected, className, readOnly }: Props) {
  const [items, setItems] = useState<MediaDto[]>(initialMedia ?? []);

  useEffect(() => {
    onSelected(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function deleteMedia(idx: number) {
    setItems(items.filter((_f, index) => index !== idx));
  }

  function onDroppedFiles(e: FileBase64[]) {
    const newAttachments: MediaDto[] = [...items];
    e.forEach(({ file, base64 }) => {
      newAttachments.push({
        title: file.name.split(".").slice(0, -1).join("."),
        file: base64,
        name: file.name,
        type: file.type,
      });
    });
    setItems(newAttachments);
  }

  return (
    <div className={className}>
      <label htmlFor="result" className="block text-xs font-medium text-gray-700">
        {property.title}
        {property.isRequired && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="mt-1">
        {/* <UploadDocuments onDropped={onDroppedFile} /> */}
        {!readOnly && <UploadDocuments disabled={disabled} multiple={true} onDroppedFiles={onDroppedFiles} />}

        {items.map((item, idx) => {
          return <input key={idx} type="hidden" name={property.name + `[]`} value={JSON.stringify(item)} />;
        })}

        {items.length > 0 ? (
          <div>
            {items.map((item, idx) => {
              return (
                <MediaItem
                  key={idx}
                  title={item.title}
                  type={item.type}
                  onChangeTitle={(title) =>
                    updateItemByIdx(items, setItems, idx, {
                      title,
                    })
                  }
                  onDelete={() => deleteMedia(idx)}
                  readOnly={readOnly}
                />
              );
            })}
            <div></div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

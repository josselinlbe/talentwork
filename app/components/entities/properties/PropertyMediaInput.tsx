import { Media } from "@prisma/client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { FileBase64 } from "~/application/dtos/shared/FileBase64";
import PreviewMediaModal from "~/components/ui/media/PreviewMediaModal";
import MediaItem from "~/components/ui/uploaders/MediaItem";
import UploadDocuments from "~/components/ui/uploaders/UploadDocument";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";

interface Props {
  initialMedia: Media[] | undefined;
  property: PropertyWithDetails;
  disabled?: boolean;
  onSelected: (item: MediaDto[]) => void;
  className?: string;
  readOnly?: boolean;
}
export default function PropertyMediaInput({ initialMedia, property, disabled, onSelected, className, readOnly }: Props) {
  const { t } = useTranslation();

  const [items, setItems] = useState<MediaDto[]>(initialMedia ?? []);
  const [selectedItem, setSelectedItem] = useState<MediaDto>();

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

  function preview(item: MediaDto) {
    setSelectedItem(item);
  }

  function download(item: MediaDto) {
    const downloadLink = document.createElement("a");
    const fileName = item.name + "." + item.type.split("/")[1];
    downloadLink.href = item.file;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  return (
    <div className={className}>
      <label htmlFor="result" className="block text-xs font-medium text-gray-700">
        {t(property.title)}
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
                  item={item}
                  onChangeTitle={(title) =>
                    updateItemByIdx(items, setItems, idx, {
                      title,
                    })
                  }
                  onDelete={() => deleteMedia(idx)}
                  readOnly={readOnly}
                  onDownload={() => download(item)}
                  onPreview={() => preview(item)}
                />
              );
            })}
            <div></div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      {selectedItem && <PreviewMediaModal item={selectedItem} onClose={() => setSelectedItem(undefined)} onDownload={() => download(selectedItem)} />}
    </div>
  );
}

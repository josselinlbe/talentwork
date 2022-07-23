import { EmailAttachment, Entity } from "@prisma/client";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowWithDetails, updateRowMedia } from "../db/entities/rows.db.server";
import { createSupabaseFile, deleteSupabaseFile } from "../integrations/supabaseService";

export function getAttachmentToMedia(attachment: EmailAttachment): MediaDto {
  return {
    title: attachment.name,
    name: attachment.name,
    file: attachment.publicUrl ?? attachment.content,
    type: attachment.type,
  };
}

export async function storeRowMediaInStorageProvider(entity: Entity, row: RowWithDetails | null) {
  if (!row) {
    return;
  }
  const mediaRowValues = row.values.filter((f) => f.media && f.media.length > 0);
  return await Promise.all(
    mediaRowValues.map(async (mediaRowValue) => {
      if (mediaRowValue.media) {
        return await Promise.all(
          mediaRowValue.media.map(async (media) => {
            if (process.env.SUPABASE_API_URL && process.env.SUPABASE_KEY) {
              try {
                const blob = await (await fetch(media.publicUrl ?? media.file)).blob();
                const file = new File([blob], media.name);
                const createdFile = await createSupabaseFile(entity.name, media.id + "-" + media.name, file);
                if (createdFile.publicUrl) {
                  return await updateRowMedia(media.id, {
                    file: "",
                    publicUrl: createdFile.publicUrl,
                    storageBucket: entity.name,
                    storageProvider: "supabase",
                  });
                }
              } catch (e) {
                // eslint-disable-next-line no-console
                console.log("Could not create file: " + e);
              }
            }
          })
        );
      }
    })
  );
}

export async function deleteRowMediaFromStorageProvider(row: RowWithDetails | null) {
  if (!row) {
    return;
  }
  const mediaRowValues = row.values.filter((f) => f.media && f.media.length > 0);
  return await Promise.all(
    mediaRowValues.map(async (mediaRowValue) => {
      if (mediaRowValue.media) {
        return await Promise.all(
          mediaRowValue.media.map(async (media) => {
            if (media.publicUrl && media.storageBucket && media.storageProvider === "supabase") {
              if (process.env.SUPABASE_API_URL && process.env.SUPABASE_KEY) {
                try {
                  await deleteSupabaseFile(media.storageBucket, media.id + "-" + media.name);
                  return await updateRowMedia(media.id, {
                    file: "",
                    publicUrl: "",
                    storageBucket: "",
                    storageProvider: "",
                  });
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.log("Could not delete supabase file: " + e);
                }
              }
            }
          })
        );
      }
    })
  );
}

import { EmailAttachment } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const supabaseUrl = process.env.SUPABASE_API_URL?.toString() ?? "";
  const supabaseKey = process.env.SUPABASE_KEY?.toString() ?? "";
  return createClient(supabaseUrl, supabaseKey);
}

async function getOrCreateSupabaseBucket(id: string, isPublic: boolean) {
  const client = getClient();

  const existingBucket = await client.storage.getBucket(id);
  if (existingBucket.data) {
    return {
      data: existingBucket.data,
      error: existingBucket.error,
    };
  }
  const newBucketId = await client.storage.createBucket(id, {
    public: isPublic,
  });
  if (newBucketId.data) {
    const newBucket = await client.storage.getBucket(newBucketId.data);
    if (newBucket.data) {
      return {
        data: newBucket.data,
        error: newBucket.error,
      };
    }
  }
  return {
    data: null,
    error: newBucketId.error,
  };
}

export async function createSupabaseFile(
  bucketId: string,
  path: string,
  file: File
): Promise<{
  id: string;
  publicUrl: string | null;
}> {
  const client = getClient();
  const bucket = await getOrCreateSupabaseBucket(bucketId, true);
  if (!bucket.data) {
    if (bucket.error) {
      throw Error("Could not create supabase bucket: " + bucket.error.message);
    } else {
      throw Error("Could not create supabase bucket: Unknown error");
    }
  }

  const supabaseFileId = await client.storage.from(bucket.data.id).upload(path, file);
  if (!supabaseFileId.data) {
    if (supabaseFileId.error) {
      throw Error("Could not create supabase file: " + supabaseFileId.error.message);
    } else {
      throw Error("Could not create supabase file: Unknown error");
    }
  }

  return {
    id: supabaseFileId.data.Key,
    publicUrl: await getSupabaseFilePublicUrl(bucketId, path),
  };
}

export async function getSupabaseFilePublicUrl(bucketId: string, path: string): Promise<string | null> {
  const client = getClient();

  const supabaseFile = await client.storage.from(bucketId).getPublicUrl(path);
  if (!supabaseFile.data) {
    if (supabaseFile.error) {
      throw Error("Could not get supabase file: " + supabaseFile.error.message);
    } else {
      throw Error("Could not get supabase file: Unknown error");
    }
  }
  return supabaseFile.publicURL;
}

export function getSupabaseAttachmentBucket() {
  return "email-attachments";
}
export function getSupabaseAttachmentPath(attachment: EmailAttachment) {
  return attachment.id + "-" + attachment.name;
}

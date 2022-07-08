export async function createBlobFromBase64(type: string, content: string) {
  const response = await fetch(`data:${type};base64,${content}`);
  return await response.blob();
}

export async function getBase64FromBlob(blob: Blob) {
  let buffer = Buffer.from(await blob.text());
  return buffer.toString("base64");
}

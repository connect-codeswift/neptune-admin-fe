import type { FileModule } from "@/lib/files";
import { validateFileForModule } from "@/lib/files";
import {
  commitFile,
  createUploadIntent,
  putFileToSignedUrl,
} from "@/services/files.service";

export type FileUploadResult = Readonly<{
  fileId: string;
  name: string;
  bytes: number;
  mimeType: string;
}>;

/**
 * Three-step private-bucket upload. Persist `fileId`, never a signed URL.
 * Ready for when admin screens grow photo / document pickers.
 */
export async function uploadFile(
  file: File,
  module: FileModule,
): Promise<FileUploadResult> {
  const contentType = file.type.trim() || "application/octet-stream";
  const error = validateFileForModule(file, module);
  if (error) throw new Error(error);

  const intent = await createUploadIntent({
    fileName: file.name.trim() || "file",
    contentType,
    sizeBytes: file.size,
    module,
    withThumbnail: false,
  });

  await putFileToSignedUrl(intent.uploadUrl, file, contentType);
  const fileId = await commitFile(intent.fileId);

  return {
    fileId,
    name: file.name.trim() || "file",
    bytes: file.size,
    mimeType: contentType,
  };
}

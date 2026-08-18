import type { FileModule } from "@/lib/files";

export type CreateUploadIntentPayload = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  module: FileModule;
  withThumbnail?: boolean;
};
